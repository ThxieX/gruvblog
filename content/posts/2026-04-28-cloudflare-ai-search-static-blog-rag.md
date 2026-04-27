---
title: 给静态博客接入 Cloudflare AI Search：零后端的 RAG 实践
date: 2026-04-28
categories:
  - AI Engineering
tags:
  - RAG
  - Cloudflare
  - AutoRAG
  - LLM
excerpt: "用 Cloudflare AI Search (AutoRAG) 的 Public Endpoint 给静态博客加上一个能引用原文的 AI 问答助手，全程零后端、零向量库、零推理成本。"
aiSummary: "介绍如何在纯静态 Next.js 博客上集成 Cloudflare AI Search (AutoRAG)，通过 Public Endpoint 直连 OpenAI 兼容的 /chat/completions 接口实现 RAG 问答。文章详解了 AutoRAG 在标准 SSE 之上扩展的 event: chunks 自定义事件如何承载检索源、前端如何用状态机区分两种事件、如何对源文档去重并跳回博客原文，以及多轮上下文裁剪、AbortController 取消请求等工程实践。最后总结了零后端 RAG 的适用边界与 Public Endpoint 的限制。"
---

> 给一个纯静态博客加上"问点啥就答点啥、还能告诉你答案出自哪篇文章"的 AI 助手，需要多少基础设施？
>
> 在 Cloudflare AI Search 出现之前的答案是：向量数据库 + 嵌入模型 + 检索服务 + LLM 推理 + 一个能跑这一切的后端。
>
> 现在的答案是：**一个公开 URL**。

本文记录了把 [Cloudflare AI Search (AutoRAG)](https://developers.cloudflare.com/ai-search/) 接入这个博客的全过程，重点放在那些官方文档里没怎么展开、但你真正写代码会撞到的细节上。

## TL;DR

- Cloudflare AI Search 是一个 **全托管的 RAG 引擎**，把"切分 → 嵌入 → 向量检索 → LLM 生成 → 引用回传"全部打包到一个 OpenAI 兼容的 HTTP 接口里。
- 三种集成方式中，**Public Endpoint** 最适合静态博客：浏览器直接 `fetch`，不需要任何后端。
- 流式协议在标准 OpenAI SSE 之上多了一个 `event: chunks` 自定义事件，**这才是溯源能力的载体**，前端要用一个事件状态机来分流。
- 整个博客的"AI Ask"功能 = 一个 React 组件 + 一个环境变量，没有 Worker、没有 Edge Function、没有数据库。

---

## 一、为什么不是自己搭一套 RAG

最开始我是想自己拼的。脑子里的清单大概长这样：

- 切分：写一个把 Markdown 按标题/段落切块的脚本
- 嵌入：调用 OpenAI / BGE / Cohere 的嵌入接口
- 存储：搞一个 Pinecone / Qdrant / pgvector
- 检索：自己写 hybrid search + rerank
- 生成：再调一次 LLM，把检索结果塞进 prompt
- 部署：因为前面这堆都要 API key，得有个后端代理

对一个**完全静态、零运行时的个人博客**来说，这阵仗显然过头了。我需要的不是"自研 RAG 框架"，而是"能用就行的 RAG 服务"。

Cloudflare AI Search（也就是仍处于 Beta 的 AutoRAG）正好把上面整条链路打包成一个托管服务：你只需要把 Markdown 同步到 R2，剩下的它全包。

## 二、Cloudflare AI Search 是什么

简单说，AutoRAG 是 Cloudflare 把自家的 R2（对象存储）+ Vectorize（向量库）+ Workers AI（推理）+ 自动化的 chunking/embedding 流水线缝合在一起，对外暴露成一个**对话式检索接口**。

它的架构大致是：

```text
R2 Bucket (你的 markdown)
    │
    ▼
AutoRAG Pipeline (自动 chunking + embedding)
    │
    ▼
Vectorize (向量库)
    │
    ▼
Workers AI (LLM 生成)
    │
    ▼
AI Search Endpoint (OpenAI 兼容)
```

对使用者来说，**所有中间环节都是黑箱**。你看到的就是一个 URL：

```text
https://<INSTANCE_ID>.search.ai.cloudflare.com
```

## 三、三种集成方式，为什么选 Public Endpoint

官方提供了三种调用方式：

| 方式 | 调用方 | 是否需要后端 | 适用场景 |
|---|---|---|---|
| Workers Binding | Cloudflare Worker 内通过 binding 直连 | 是（Worker） | 已经在 Cloudflare 生态里 |
| REST API | 携带 API Token 调用官方 REST | 是（代理签名） | 需要严格鉴权 |
| **Public Endpoint** | **任意客户端直接 HTTP 调用** | **否** | **静态站、原型、Demo** |

对一个 SSG 博客来说，前两种都得引入一个仅仅为了"代理签名"而存在的后端，划不来。所以这里选的是 Public Endpoint —— 在 Cloudflare 控制台开启实例的 "Public access" 后，浏览器就能直接调它了。

> 安全提醒：Public Endpoint 没有鉴权，意味着任何人都能调用。生产场景需要在 Cloudflare 侧配合 Rate Limiting / Bot Management，或者干脆切换到带 Token 的 REST 方式。

## 四、核心接口：OpenAI 兼容的 `/chat/completions`

这是整个集成里**最让我惊喜**的设计点：AI Search 的对话接口完全兼容 OpenAI Chat Completions 格式。

```ts
const AI_SEARCH_URL = `${process.env.NEXT_PUBLIC_CLOUDFLARE_AI_SEARCH_URL}/chat/completions`

const response = await fetch(AI_SEARCH_URL, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    messages: [
      { role: 'user', content: 'Thxie 的代码哲学是什么？' },
    ],
    stream: true,
  }),
})
```

这意味着任何写过 OpenAI 客户端、`ai-sdk`、LangChain 的代码，几乎都能零改动迁过来。Cloudflare 在协议层做的兼容工作，让"切换 RAG 提供商"这件事的成本极低。

## 五、多轮对话：前端裁剪上下文

AutoRAG 端**不持久化会话**，每次请求都需要前端把对话历史一并传上去。如果不加控制，长对话会让 token 成本直线飙升，所以我加了一个滑动窗口：

```ts
const MAX_CONTEXT_TURNS = 10

const contextMessages = messages
  .slice(-(MAX_CONTEXT_TURNS * 2)) // 一轮 = user + assistant 两条
  .map(m => ({ role: m.role, content: m.content }))

const allMessages = [
  ...contextMessages,
  { role: 'user' as const, content: text.trim() },
]
```

只保留最近 10 轮对话作为上下文，足够覆盖大多数博客读者的"追问"场景，又不会让请求体爆炸。

## 六、看懂流式响应：`data:` + 自定义 `event: chunks`

到这里你可能以为 SSE 流还是熟悉的味道：

```text
data: {"choices":[{"delta":{"content":"Hello"}}]}
data: {"choices":[{"delta":{"content":" world"}}]}
data: [DONE]
```

但 AutoRAG 在标准 OpenAI SSE 之上 **多塞了一个自定义事件类型**，用来回传 RAG 检索命中的原文 chunk：

```text
event: chunks
data: [{"id":"...","score":0.87,"text":"...","item":{"key":"2015-06-26-singleton-pattern.md"}}]

data: {"choices":[{"delta":{"content":"单例"}}]}
data: {"choices":[{"delta":{"content":"模式"}}]}
data: {"choices":[{"delta":{"content":"是..."}}]}
data: [DONE]
```

注意：

1. `event: chunks` 一般 **先于** 内容 `delta` 到达 —— 这给 UI 提供了一个绝佳的体验切入点：**先把"参考资料"卡片渲染出来，再开始流式显示答案**。读者在看到首个文字之前就已经知道"这次回答有据可查"。
2. 普通 `data:` 行的 payload 是 OpenAI 标准结构，没有 `event:` 前缀。
3. 同一个 SSE 流里两种事件交错出现，前端必须用一个**状态机**来区分。

```ts
const reader = response.body!.getReader()
const decoder = new TextDecoder()
let fullContent = ''
let sources: Source[] = []
let currentEventType = '' // 关键：跟踪当前事件类型

while (true) {
  const { done, value } = await reader.read()
  if (done) break

  const chunk = decoder.decode(value, { stream: true })
  for (const line of chunk.split('\n')) {
    const trimmed = line.trim()

    // 命中 event: 行，更新当前事件类型
    if (trimmed.startsWith('event:')) {
      currentEventType = trimmed.slice(6).trim()
      continue
    }

    if (trimmed.startsWith('data:')) {
      const data = trimmed.slice(5).trim()
      if (data === '[DONE]') continue

      const parsed = JSON.parse(data)

      if (currentEventType === 'chunks' && Array.isArray(parsed)) {
        // RAG 命中的源文档
        sources = parsed
        setCurrentSources(sources)
      } else if (parsed.choices?.[0]?.delta?.content) {
        // 普通生成 token
        fullContent += parsed.choices[0].delta.content
        setStreamingContent(fullContent)
      }
    }
  }
}
```

这段状态机是整个集成里 **唯一不那么"OpenAI 兼容"** 的部分，但理解了它，AI Search 的协议层就基本没有死角了。

## 七、`chunks` 事件的载荷结构

每条 chunk 的字段：

```ts
interface Source {
  id: string                          // chunk 唯一标识
  score: number                       // 检索相关度（0-1）
  text: string                        // chunk 原文，可作为 hover 预览
  item: {
    key: string                       // 原始文件名，例如 "2015-06-26-singleton-pattern.md"
    metadata?: Record<string, unknown> // 上传时的自定义元数据
    timestamp?: number
  }
}
```

围绕这个结构我做了两件实战处理。

### 7.1 同文章去重，保留最高分 chunk

一篇文章经常会被切成多个 chunk，同时命中检索。直接渲染会出现"5 张卡片其实指向 2 篇文章"的尴尬，所以按 `item.key` 去重，保留分数最高的：

```ts
const uniqueSources = sources.reduce<Source[]>((acc, source) => {
  const existingIndex = acc.findIndex(s => s.item.key === source.item.key)
  if (existingIndex === -1) {
    acc.push(source)
  } else if (source.score > acc[existingIndex].score) {
    acc[existingIndex] = source
  }
  return acc
}, [])
```

### 7.2 从 `key` 反推博客 URL

R2 里的对象 key 是文件名（带日期前缀），博客的路由是 slug（不带日期）。需要做一次双向映射，才能让"参考资料"卡片直接跳到原文：

```ts
function getSourceUrl(key: string): string | null {
  const match = key.match(/(?:posts\/)?([^/]+?)(?:\.mdx?)?$/i)
  if (!match) return null
  // 剥离日期前缀，例如 "2015-06-26-singleton-pattern" → "singleton-pattern"
  const slug = match[1].replace(/^\d{4}[-_]\d{2}[-_]\d{2}[-_]?/, '')
  return slug ? `/posts/${slug}` : null
}
```

这个 helper 把 RAG 的"溯源"从一个**纯展示**功能升级成了**可点击跳转**的导航闭环 —— 读者点一下卡片就能从 AI 摘要直接落回原文细节。

## 八、取消请求：双重清理

流式响应有个很容易踩的坑：**仅仅 abort fetch 不会真正释放 reader**。如果用户疯狂点击"停止/重新提问"，会出现 reader 泄漏。所以这里需要 **双重清理**：

```ts
const abortControllerRef = useRef<AbortController | null>(null)
const readerRef = useRef<ReadableStreamDefaultReader<Uint8Array> | null>(null)

const stopGeneration = useCallback(async () => {
  // 先取消 reader，主动关闭底层连接
  if (readerRef.current) {
    try { await readerRef.current.cancel() } catch {}
    readerRef.current = null
  }
  // 再 abort fetch
  if (abortControllerRef.current) {
    abortControllerRef.current.abort()
    abortControllerRef.current = null
  }

  // 把已经流式收到的内容沉淀为完整消息，避免"白点击"
  if (streamingContent) {
    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      role: 'assistant',
      content: streamingContent,
      sources: currentSources.length > 0 ? currentSources : undefined,
    }])
  }
}, [streamingContent, currentSources])
```

最后那段"已流式内容沉淀为消息"的逻辑很重要：用户中断生成，并不意味着已经吐出来的字就要丢掉，**保留它对体验影响巨大**。

## 九、数据源同步：博客 → R2

博客这边只做一件事：把 `content/posts/*.md` 同步到 R2 的指定 bucket。AutoRAG 会监听 bucket 变化、自动重新切分和嵌入。

我用的是 GitHub Actions + `wrangler r2 object put`，每次 push 到 `main` 触发同步。Cloudflare 端的索引刷新通常在分钟级生效，对个人博客的更新频率绰绰有余。

> 如果你的内容已经能通过 sitemap.xml 公网访问，AutoRAG 也支持直接配置 **Website 数据源**，让 Cloudflare 自己来抓你的站点。这个项目同时构建了 `/sitemap.xml` 和 `/robots.txt`，所以两种方式都通。

## 十、效果与限制

最终效果：

- 一个 `app/ai/page.tsx`、约 600 行代码（含 UI），就是这个博客 AI 助手的全部。
- **零后端、零向量库、零推理成本**（按 Cloudflare 用量计费，对个人博客几乎免费）。
- 流式渲染 + 引用卡片 + 多轮上下文 + 取消生成全部齐活。

限制也得说清楚：

1. **Beta 阶段**：API 还在演进，自定义事件类型未来可能微调。
2. **Prompt 不可深度自定义**：AutoRAG 的系统 prompt 是托管的，你拿不到原始的 retrieved chunks 去自己拼 prompt（虽然 `event: chunks` 给了你只读的副本）。如果需要复杂的 prompt 工程，还是得切到自建。
3. **Public Endpoint 没有鉴权**：见前文，生产环境要补 Rate Limiting 或换成 Token 模式。
4. **检索质量取决于切分**：托管的好处是省心，坏处是切分策略你说了不算。如果发现某些查询召回质量不行，目前最有效的做法不是调 AutoRAG，而是**改你的 Markdown 写作结构**（更清晰的标题层级、更小的段落、更明确的术语）。

## 十一、总结

Cloudflare AI Search 的真正价值，不在于它的某一项技术指标比自建强多少，而在于它把 RAG 这件事的**门槛降到了"一个 URL"**。

对于以下场景，它是几乎没有竞品的选择：

- 静态博客 / 文档站 / 个人项目
- 想加 AI 问答但又不想引入后端
- 已经在用 Cloudflare R2 / Pages / Workers 生态
- 需要"可溯源"的回答（这是 AutoRAG 协议层就给了的能力）

对于以下场景，建议谨慎评估：

- 需要细粒度控制 prompt / 检索策略
- 对延迟极度敏感（多了一层 Cloudflare 边缘）
- 需要严格的访问鉴权 / 用量审计

回到开篇的那个问题：给静态博客加 AI 问答需要多少基础设施？

我现在的答案是：**一个 `.env` 变量。**

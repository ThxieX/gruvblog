---
title: 静态博客 + Cloudflare AI Search：零后端 RAG 实践
date: 2026-03-28
categories:
  - AI Engineering
tags:
  - RAG
  - LLM
  - Cloudflare
excerpt: "Cloudflare AI Search 给静态站加上一个能引用原文的 AI 问答助手，零后端、零向量库。"
aiSummary: "介绍如何在纯静态 Next.js 站点上集成 Cloudflare AI Search (AutoRAG)，在对比 Workers Binding、REST API 和 Public Endpoint 三种集成方式后，作者选择了最轻量的通过 Public Endpoint 直连 OpenAI 兼容的 /chat/completions 接口实现 RAG 问答 MVP。工作流上实现发布即同步的自动化索引更新。"
---


去年就想给博客网站加一点 AI 味道 ✨ 「问啥答啥，还能告诉你答案出自哪篇文章的 AI 助手 🤖」

🧾 脑子里的清单是

- 切分：把文章 Markdown 按标题 / 段落拆块
- 嵌入：调用 Embedding 模型接口
- 存储：搞一个向量库
- 检索：自己写 hybrid search + rerank
- 生成：调用 LLM，把检索结果塞进 prompt
- 部署：整一层后端代理

这显然不是在加一个简单功能，而是在做一套 “RAG 服务”，过头了 🙅‍♂️🙅‍♂️🙅‍♂️～

本着网站 “完全静态 + 零运行时” 的原则，我需要 RAG，但我需要 0 后端 🙅‍♂️ 。


正好看到 Cloudflare Build 页面里的 AI Search（Beta），快速体验非常顺滑～

提供多种接入方式，命中我想要的场景（天然适合静态博客 / 文档站 / 个人项目等场景）。

最主要是免费额度完全够用，🙌 Cloudflare 大善人！！！


## TL;DR

- Cloudflare AI Search 是一个 **全托管的 RAG 引擎**，把"切分 → 嵌入 → 向量检索 → LLM 生成传"全部打包。
- 三种集成方式中，**Public Endpoint** 最适合静态站点：浏览器直接 `fetch`，零后端。
- Open AI 兼容接口，流式协议在标准 OpenAI SSE 之上增加 `event: chunks` 自定义事件获取检索源信息。
- 一个网站的"AI Ask"功能 = 一个 React 组件 + 一个 `.env` 环境变量。无需自建基础设施。


![ai_ask_preview|480](https://blog-md-pic-1259135436.cos.ap-chengdu.myqcloud.com/2026/ai_ask_preview.png)


---


## 接入方式

[Cloudflare AI Search 快速体验](/posts/cloudflare-ai-search-quickstart) 已经介绍了几种使用方式。

👉 更推荐参考官方文档 [Cloudflare Docs#AI Search](https://developers.cloudflare.com/ai-search/)

在这里，最简单的接入方式，你只需要使用一个**对话式检索接口**

```text
Datasource（R2 Bucket / Built-in Storage / Web Crawl）
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
AI Search Endpoint (OpenAI 兼容) 👈     
```


**为什么选择 Public Endpoint 作为集成方式 ？**

我筛选了这几种支持方式

| 方式                  | 调用方                              | 是否需要后端    | 适用场景               |
| ------------------- | -------------------------------- | --------- | ------------------ |
| Workers Binding     | Cloudflare Worker 内通过 binding 直连 | 是（Worker） | 已经在 Cloudflare 生态里 |
| REST API            | 携带 API Token 调用官方 REST           | 是（代理签名）   | 需要严格鉴权             |
| **Public Endpoint** | **任意客户端直接 HTTP 调用**              | **否**     | **静态站、原型、Demo**    |

对一个简单的 SSG 博客来说，前两种都得引入一个仅仅为了"代理签名"而存在的后端，划不来。

所以这里我选的是最简单的 Public Endpoint 方式 —— 在 Cloudflare AI Search 实例的 Settings 中开启 Public URL 即可。

开启后你就获得了 3 个可用的 Endpoint
- Search endpoint：`https://<INSTANCE_ID>.search.ai.cloudflare.com/search`
- Chat completions endpoint 👈：`https://<INSTANCE_ID>.search.ai.cloudflare.com/chat/completions`
- MVP Server: `https://<INSTANCE_ID>.search.ai.cloudflare.com/mcp`


Curl 测试

```curl
curl https://<INSTANCE_ID>.search.ai.cloudflare.com/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {
        "content": "Who are you?",
        "role": "user"
      }
    ]
  }'
```


> 安全提醒：Public Endpoint 没有鉴权，意味着任何人都能调用。
> 生产场景需要在 Cloudflare 侧配合 Rate Limiting / CORS 规则，限定域访问，或者干脆切换到带 Token 的 REST 方式。



---


## AI Ask（MVP 实现）

### 核心接口

AI Search 的对话接口完全兼容 OpenAI Chat Completions 格式。

Cloudflare 在协议层做的兼容工作，这意味着任何写过 OpenAI 客户端、`ai-sdk`、LangChain 的代码，几乎都能零改动迁过来。

```typescript
const AI_SEARCH_URL = `${process.env.NEXT_PUBLIC_CLOUDFLARE_AI_SEARCH_URL}/chat/completions`

const response = await fetch(AI_SEARCH_URL, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    messages: [
      { role: 'user', content: 'Who are you?' },
    ],
    stream: true,
  }),
})
```


### 多轮对话

AI Search（AutoRAG）端本身不持久化会话，你可以在每次请求时把对话历史一并传上去，并增加滑动窗口来裁剪上下文。


```typescript
const MAX_CONTEXT_TURNS = 10 // 保留最近 10 轮对话作为上下文

const contextMessages = messages
  .slice(-(MAX_CONTEXT_TURNS * 2)) // 一轮 = user + assistant 两条
  .map(m => ({ role: m.role, content: m.content }))

const allMessages = [
  ...contextMessages,
  { role: 'user' as const, content: text.trim() },
]
```


### SSE 流 event:chunks

> API 参考
> - [rest-api/#chat-completions](https://developers.cloudflare.com/ai-search/api/search/rest-api/#chat-completions)
> - [AI Search > Instances > Chat Completions](https://developers.cloudflare.com/api/resources/ai_search/subresources/instances/methods/chat_completions/)

开启 stream 时，想要获取 RAG 检索结果中的检索源（源文档），你需关注 `event:chunks` 事件。

这是在标准 OpenAI SSE 之上 **多塞了一个自定义事件类型**，用来回传 RAG 检索命中的原文 chunk：

```text
event: chunks
data: [{"id":"...","score":0.87,"text":"...","item":{"key":"2015-06-26-singleton-pattern.md"}}]

data: {"choices":[{"delta":{"content":"单例"}}]}
data: {"choices":[{"delta":{"content":"模式"}}]}
data: {"choices":[{"delta":{"content":"是..."}}]}
data: [DONE]
```

我需要在 AI Ask 功能中能够返回文章 Source 作为“引用来源”（有据可查），并支持链接跳转到对应文章详情。

注意：

1. `event: chunks` 一般 **先于** 内容 `delta` 到达。
2. 普通 `data:` 行的 payload 是 OpenAI 标准结构，没有 `event:` 前缀。


每条 chunk data 的 Payload 如下

```json
[{
	"id": "chunk-001", // chunk 唯一标识
	"type": "text",
	"score": 0.85, // 检索相关度（0-1）
	"text": "...", // chunk 原文，可作为 hover 预览
	"item": {
		"key": "about-cloudflare.md", // 原始文件名，例如 "2015-06-26-singleton-pattern.md"
		"timestamp": 1775925540000
	},
	"scoring_details": {
		"vector_score": 0.85
	}
}]
```

基于此可以将同文章去重，保留最高分 chunk。

**如何从 key 反推博客 URL ？**

这里我的对象 key 是文件名（带日期前缀），博客的路由是 slug（不带日期）。

所以只需要按这个规则做一次双向映射，就能让"参考资料"卡片直接跳到原文：
- e.g. ` key = "2015-06-26-singleton-pattern" → "singleton-pattern"`


---

## 更新工作流

🔄 核心工作流
- 🤖 自动化 ，🙅‍♂️ 手动重复操作 
- 👉 对于**静态博客 / 文档站**来说，做到“发布即同步” 🚀


**1) 数据源更新**

AI Search 支持直接配置 Website 作为数据源，所以最好你的站点构建了 `/sitemap.xml` 和 `/robots.txt`，让 Cloudflare 自己来抓你的站点。

如果使用 R2 存储桶或 Built-in Storage 方式，也完全可以自动化：
- 结合 GitHub Actions + `wrangler r2 object put`，每次提交或构建时自动触发上传和更新内容。
- e.g. `wrangler r2 object put content/posts/hello.md --file ./posts/hello.md`



**2）向量索引更新**

⏱️ Cloudflare 端的索引刷新通常在分钟级生效，可以在 Jobs 中设置。

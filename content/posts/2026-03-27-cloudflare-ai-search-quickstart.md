---
title: Cloudflare AI Search 快速体验
date: 2026-03-27
categories:
  - AI Engineering
tags:
  - RAG
  - LLM
  - Cloudflare
excerpt: "快速体验 Cloudflare AI Search 全托管 RAG 引擎。"
aiSummary: "Cloudflare AI Search（Beta）是一款全托管 RAG 引擎，Dashboard 创建实例后即可通过 Playground 测试。应用集成支持 REST API、Workers & Pages、Web Component 和 Public Endpoint 四种方式。"
---




> 👉 The search primitive for your applications and agents.

Cloudflare AI Search（以前的 AutoRAG）：是一个全托管 RAG 引擎，一个 no-code RAG pipeline，由 Cloudflare 端完成"分块 → 嵌入 → 向量检索 → LLM 生成 → 答案 + 引用"全流程。

虽然目前仍处于 Beta 阶段，但它与 Workers AI，AI Gateway，R2 存储桶等产品的生态联动让人非常期待。



## Quickstart

构建一个 AI Search 实例非常简单：Cloudflare Dashboard → AI → AI Search

> 可以参考官网 [Get Started](https://developers.cloudflare.com/ai-search/get-started/)

### Step 1: 数据源

创建实例的第一步就要选择数据源
- 支持 R2 存储桶
- 支持 Website 抓取
- 最近还支持了内置存储（可以直接在实例 items 里上传）

注意 Website 抓取的工作原理：
- 👉 sitemap → robots.txt → /sitemap.xml → 放弃
- [#how-website-crawling-works](https://developers.cloudflare.com/ai-search/configuration/data-source/website/#how-website-crawling-works)

内置 Jobs 可以配置手动和自动化索引。


### Step 2: 基础配置

包括基础 AI Gateway（提供统一 Unified API， 统一控制，路由，观测等）的设置。

以及 Indexing 和 Retrieval 的设置
- 基础参数：Embedding 模型，Chunk 设置，分数设置等
- 功能启用：包括是否启用 Hybrid Search，Rerank，查询重写等都有提供。

这些可以在之后的实例 Settings 中修改，重新 Index 即可。

> [System prompt](https://developers.cloudflare.com/ai-search/configuration/retrieval/system-prompt/#system-prompt-configuration) 的设置也在 Settings 中

### Step 3: 测试 & 预览

实例中的 Playground 提供了 Chat 和 Search 两种进行测试，支持预览和调试。

![cf-ai-search-playground](https://blog-md-pic-1259135436.cos.ap-chengdu.myqcloud.com/2026/cf-ai-search-playground.png)




## 应用集成

👉 Connect AI Search to your application

得益于 Cloudflare 已有的产品生态，生态联动和应用集成也变得很容易。


### REST API

AI Search 提供了两种用于查询实例的 API 端点（与 OpenAI 兼容的 `messages` 格式）
- Search (`/search` )
- Chat completions (`/chat/completions`)

e.g. 
```curl
curl -X POST "https://api.cloudflare.com/client/v4/accounts/<ACCOUNT_ID>/ai-search/instances/<INSTANCE_NAME>/chat/completions" \
  -H "Authorization: Bearer <API_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {
        "content": "What is Cloudflare?",
        "role": "user"
      }
    ]
  }'
```


### Workers & Pages

👉 Build & deploy serverless functions, sites, and full-stack applications.

这是 Cloudflare 提供的超快速创建 Application 的方式，可以通过 workers 把刚才创建的知识库 RAG 能力完整开放出来。

🍺 Try it：
- 只需绑定一个 Workers AI
- 简单编写一个 `workers.js` 用于预览

```javascript

// ===========
// 实例名称："blog_post_search"
// Workers AI 绑定的变量名称："AI" 
export default {
  async fetch(request, env) {
    const { query } = await request.json();
    const result = await env.AI.autorag("blog_post_search").aiSearch({  // Variables
      query,
      stream: false
    });

    return new Response(
      JSON.stringify(result),
      {
        headers: {
          "Content-Type": "application/json"
        }
      }
    );
  }
};
```

- 一键部署后就可以拿到 Priview URL

![cf-ai-search-workers-demo](https://blog-md-pic-1259135436.cos.ap-chengdu.myqcloud.com/2026/cf-ai-search-workers-demo.png)

可以定义自己的 Domain，配置 API 令牌 ～

基于此，你可以制作更加精美的 Embed AI Search 在任何网站上～

### Web Component

如果想把搜索界面直接嵌入到网站里，Cloudflare 提供了一套预制的配置丰富的 Web Components。

I didn't try. 👉 You can try [Embed AI Search on your website](https://search.ai.cloudflare.com/)


### Public Endpoint

一种不需要身份验证的集成方式，只需要提供一个自己 AI Search 实例 `INSTANCE_ID` 的 Endpoint 即可。

```
https://<INSTANCE_ID>.search.ai.cloudflare.com
```

这提供了一种可以在完全无后端，直接在前端应用中植入 RAG 的能力。

|端点|路径|用途|
|---|---|---|
|**聊天补全**|`/chat/completions`|直接进行 RAG 问答，返回生成后的答案。兼容 OpenAI API 格式。|
|**语义搜索**|`/search`|只做检索，返回相关的原始文档块（chunks），不进行 LLM 生成。|
|**MCP**|`/mcp`|提供给 AI Agent 调用的标准化接口，支持 Model Context Protocol。|

因为是 Public Endpoint，无需 API Token（Bearer Auth)，所以你需要有安全考量的设置，例如速率限制，CORS 规则以及特定域的访问。

<div align="center">

# GruvBlog

一个以 Gruvbox 风格为核心的极简、高速且美观的开发者博客，支持多主题。

[English](./README.md) | 简体中文

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38bdf8?logo=tailwindcss)](https://tailwindcss.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178c6?logo=typescript)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

[预览](https://thxie.com) · [文档](#配置) · [报告问题](https://github.com/ThxieX/gruvblog/issues)

</div>

<br />

<table>
  <tr>
    <td align="center" width="50%">
      <img src="public/images/themes.png" alt="Themes" width="100%" />
      <br />
      <sub>Themes</sub>
    </td>
    <td align="center" width="50%">
      <img src="public/images/preview.png" alt="Preview" width="100%" />
      <br />
      <sub>Preview</sub>
    </td>
  </tr>
</table>

---

## ✨ 特性

- ⚡️ **闪电般快速** — 静态生成，零运行时 Markdown 解析（快速、SEO 友好）
- 🎨 **多主题** — Gruvbox (Light/Dark/Soft/High Contrast) + Catppuccin
- 🌍 **国际化** — 英语、中文、日语开箱即用
- 💬 **评论** — 基于 GitHub Discussions 的 Giscus
- 🤖 **AI 聊天** — 基于 Cloudflare AI Search 的 RAG 智能助手（可选）
- 📡 **RSS 订阅** — 自动生成的订阅源
- 🔍 **SEO 优化** — 动态 sitemap、robots.txt、Open Graph

## 🛠 技术栈

| 分类 | 技术 |
|----------|------------|
| 框架 | [Next.js 16](https://nextjs.org/) (App Router, SSG) |
| 样式 | [Tailwind CSS 4](https://tailwindcss.com/) |
| UI 组件 | [shadcn/ui](https://ui.shadcn.com/) |
| 评论 | [Giscus](https://giscus.app/) |
| AI | [Cloudflare AI Search](https://developers.cloudflare.com/ai-search/) (AutoRAG) |
| 语言 | [TypeScript 5.7](https://www.typescriptlang.org/) |

## 🚀 快速开始

### 前置要求

- Node.js 20+
- pnpm (推荐) / npm / yarn

### 安装

```bash
# 克隆仓库
git clone https://github.com/ThxieX/gruvblog.git
cd gruvblog

# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev
```

打开 [http://localhost:3000](http://localhost:3000) 查看你的博客。

## ⚙️ 配置

### 站点配置（核心）

编辑 `lib/config/site.config.ts` — 这是你**唯一需要修改的文件**：

```typescript
export const siteConfig: Config = {
  author: {
    name: 'Your Name',
    email: 'your@email.com',
    github: 'https://github.com/yourusername',
    twitter: 'https://twitter.com/yourusername',
  },
  site: {
    title: 'Your Blog Title',
    description: 'Your site description',
    url: 'https://yourdomain.com',
    locale: 'en_US', // Default locale (e.g., en_US, zh_CN, ja_JP)
    keywords: ['tech', 'programming', 'tutorial'], // SEO keywords 
    footerText: '© 2026 · Your Name · All rights reserved.', // Custom footer text  
  },
  
  // Comments (Optional) - Get values from https://giscus.app
  comments: {
    enabled: true,
    repo: 'yourusername/your-repo',
    repoId: 'YOUR_REPO_ID',
    category: 'Comments',
    categoryId: 'YOUR_CATEGORY_ID',
  },
}
```

### AI 助手（可选）

> 你可以选择不开启该功能或选择其他集成方式。
>
> 这里我使用 [Cloudflare AI Search](https://developers.cloudflare.com/ai-search/usage/) (Beta)

启用基于 Cloudflare AI Search 的 RAG 智能助手，选择你喜欢的集成方式：

- Workers Binding
- REST API
- Public Endpoint

例如，Public Endpoint
```bash
# Cloudflare AI Search 端点环境变量
NEXT_PUBLIC_CLOUDFLARE_AI_SEARCH_URL=https://<INSTANCE_ID>.search.ai.cloudflare.com
```

当前支持的数据源方式：
- **R2 Bucket**：连接 Cloudflare R2 bucket，为存储的文档建立索引。
- **Website**: 将您拥有的域名连接到网站页面索引。

> 本项目支持构建时自动生成 `/robot.txt` 以及 `/sitemap.xml`，适用于常见 Website 抓取
> 
> 可参考: [Cloudflare Docs#how-website-crawling-works](https://developers.cloudflare.com/ai-search/configuration/data-source/website/#how-website-crawling-works)



## 📝 撰写文章

### 内容结构

```
--- 原始文章 (markdown) ---
content/posts/
├── 2024-01-15-my-post.md          # 单文件（无图片）
└── 2024-01-15-my-post/            # 目录（有图片）
    ├── index.md
    └── diagram.png
```

### Frontmatter 格式


```yaml
---
title: Article Title
date: 2024-01-15
categories:  # 层级 父分类 → 子分类（越少越好，1 > 2）
  - Tech
  - AI
tags:
  - machine-learning
  - tutorial
excerpt: "TL;DR - One-line summary for previews"
aiSummary: "AI-generated summary"
---
```

### 工作流程

```bash
# 1. 创建文章
vim content/posts/2024-03-26-new-post.md

# 2. 本地预览
pnpm dev

# 3. 部署（推送时自动构建）
git add content/posts/
git commit -m "Add new post"
git push
```

### 构建流程（全自动）
```
content/posts/
├── post.md                 ─┐
└── post-with-img/           │  [pnpm build]
    ├── index.md             │
    └── *.png  ──────────────┼──────────────→  public/images/posts/*/
                             │
                             │ (全自动)
                             │
                             ▼
                  lib/generated/
                  ├── index.ts        (metadata index)
                  └── posts/*.ts      (content per post)
                             │
                             ▼
                  Static HTML (SSG) → CDN

```


## 🌐 部署

### Vercel（推荐）

> 一键部署到 Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/ThxieX/gruvblog)

### 手动构建

```bash
# 生产构建
pnpm build

# 启动生产服务器
pnpm start
```

## 🗺 路线图

- [x] 多主题支持 (Gruvbox + Catppuccin)
- [x] 国际化 (i18n)
- [x] GitHub 评论系统
- [x] AI 聊天助手
- [x] RSS 订阅源生成
- [ ] 全文搜索
- [ ] 邮件订阅
- [ ] 文章分析面板

## 🤝 贡献

欢迎贡献！请随时提交 Pull Request。

## 📄 许可证

本项目基于 MIT 许可证开源 - 详见 [LICENSE](LICENSE) 文件。


<a href="https://v0.app/chat/api/kiro/clone/ThxieX/gruvblog" alt="Open in Kiro"><img src="https://pdgvvgmkdvyeydso.public.blob.vercel-storage.com/open%20in%20kiro.svg?sanitize=true" /></a>
---

<div align="center">

**[⬆ 返回顶部](#GruvBlog)**

Made with ❤️ by [Thxie](https://github.com/ThxieX)

</div>

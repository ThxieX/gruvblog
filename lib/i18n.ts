export type Locale = 'en' | 'zh-CN' | 'ja'

export const locales: Locale[] = ['en', 'zh-CN', 'ja']

export const localeNames: Record<Locale, string> = {
  'en': 'English',
  'zh-CN': '中文',
  'ja': '日本語',
}

export const localeShortNames: Record<Locale, string> = {
  'en': 'EN',
  'zh-CN': '中文',
  'ja': 'JA',
}

// Translation dictionary
export const translations: Record<Locale, Record<string, string>> = {
  'en': {
    // Navigation
    'nav.home': 'Home',
    'nav.posts': 'Posts',
    'nav.about': 'About',
    'nav.search': 'Search',

    // Home
    'home.greeting': "Hi, I'm",
    'home.title': 'Thxie 👋',
    'home.subtitle': 'AI | Minimalist | Post-Language Programmer',
    'home.label.identity': 'I\'m:',
    'home.identity.old': 'XX Developer',
    'home.identity.new': 'To be Problem Solver',
    'home.label.mindset': 'Mindset:',
    'home.mindset.a': 'Embracing AI while demystifying it',
    'home.label.process': 'process:',
    'home.process.a': 'Building, Writing, Thinking...',
    'home.justforfun': '✨ Just for fun ! ',
    'home.recentPosts': 'Recent Posts',
    'home.viewAll': 'View all posts',

    // Posts
    'posts.title': 'Posts',
    'posts.description': 'Thoughts, Writing, Programming, and the Pursuit of Simplicity.',

    // About
    'about.tab.about': 'About',
    'about.tab.now': 'Now',
    'about.tab.uses': 'Uses',
    'about.tab.links': 'Links',
    'about.bio.intro': 'I believe the best solutions are often the most elegant ones.',
    'about.bio.line1': 'Specializing in Backend Architecture and High-Performance Systems.',
    'about.bio.line2': 'Turn any technology into a production-ready solution with AI.',
    'about.stacks': 'Skills & Technologies',
    'about.stacks.subtitle': 'How i Work',
    'about.projects': 'Projects & Contributions',
    'about.philosophy': 'Philosophy',
    'about.connect': 'Get in Touch',
    'about.connect.description': 'Open to interesting conversations and collaboration.',

    // Now
    'now.location': 'Remote',
    'now.updated': 'Updated',
    'now.description': 'A now page tells you what I am focused on at this point in my life.',
    'now.focus': 'Current Focus',
    'now.learning': 'Learning',
    'now.building': 'Building',
    'now.thinking': 'Thinking About',

    // Uses
    'uses.description': 'The tools that power my daily workflow. ——',
    'uses.dotfiles': 'Dotfiles',
    'uses.dotfiles.description': 'My config files are open source. Feel free to steal ideas.',
    'uses.hardware': 'Hardware',
    'uses.editor': 'Editor',
    'uses.terminal': 'Terminal',
    'uses.apps': 'Apps',
    'uses.entertainment': 'Entertainment',



    // Links
    'links.description': 'Blogs and resources I enjoy and recommend.',
    'links.apply': 'Want to exchange links?',
    'links.apply.description': 'If you have a blog and would like to exchange links, feel free to reach out!',

    // AI
    'ai.title': 'Ask AI',
    'ai.subtitle': 'Have a question about the blog or AI? Ask away.',
    'ai.placeholder': 'Ask me anything about AI, programming, or this blog...',
    'ai.clear': 'Clear',
    'ai.stop': 'Stop',
    'ai.error': 'Sorry, something went wrong. Please try again.',
    'ai.sources': 'Referenced Articles',
    'ai.disclaimer': 'AI-generated, may be inaccurate',

    // Comments
    // Footer
    // Theme
    // Vim
    // Confetti

    // Command Menu
    'cmd.search': 'Search...',
    'cmd.noResults': 'No results found.',
    'cmd.pages': 'Pages',
    'cmd.easterEgg': 'Easter Egg',
    'cmd.surprise': 'Surprise',
    'cmd.posts': 'Posts',
    'cmd.categories': 'Categories',
    'cmd.tags': 'Tags',
    'cmd.actions': 'Actions',
    'cmd.toggleTheme': 'Toggle theme',
    'cmd.viewAll': 'View all',
    'cmd.searchCategories': 'Search categories...',
    'cmd.searchTags': 'Search tags...',
    'cmd.allCategories': 'All Categories',
    'cmd.allTags': 'All Tags',

    // Archive
    'posts.loadEarlier': 'Load earlier posts',
    'posts.articles': 'articles',

    // Filter
    'filter.showing': 'Showing',
    'filter.matchingPosts': 'matching posts',
    'filter.clearAll': 'Clear all',
    'filter.noResults': 'No posts match your filters.',
    'filter.tryClearing': 'Try clearing some filters.',

    // Misc
    'misc.backToHome': 'Back to home',

    // Post Detail
    'post.backToPosts': 'Back to posts',
    'post.aiSummary': 'AI Summary',
    'post.moreArticles': 'More Articles',
    'post.relatedArticles': 'Related Articles',
    'post.latestArticles': 'Latest Articles'
  },
  'zh-CN': {
    // Navigation
    'nav.home': '首页',
    'nav.posts': '文章',
    'nav.about': '关于',
    'nav.search': '搜索',

    // Home
    'home.subtitle': 'AI ｜ 簡單主義 ｜ 後語言時代程序員',
    'home.recentPosts': '最新文章',
    'home.viewAll': '查看全部',

    // Posts
    'posts.title': '文章',

    // About
    'about.tab.about': '关于',
    'about.tab.now': '现在',
    'about.tab.uses': '工具',
    'about.tab.links': '链接',
    // 'about.bio.intro': '我相信，最好的解决方案往往是最优雅。',
    'about.stacks': '技能 & 技术栈',
    'about.projects': '项目 & 贡献',
    'about.philosophy': '理念',
    'about.connect': '联系我',
    'about.connect.description': '欢迎有趣的对话和合作。',

    // Now
    'now.location': '远程',
    'now.updated': '更新于',
    'now.description': 'Now 页面告诉你我现阶段的生活重心。',
    'now.focus': '当前专注',
    'now.learning': '正在学习',
    'now.building': '正在构建',
    'now.thinking': '在思考',

    // Uses

    // Friends
    'links.description': '我喜欢和推荐的博客与资源。',
    'links.apply': '想交换链接？',
    'links.apply.description': '如果你有博客并且想交换链接，请随时联系我！',

    // AI
    'ai.title': 'AI 问答',
    'ai.subtitle': '有关于博客或 AI 的问题？尽管问。',
    'ai.placeholder': '问我任何关于 AI、编程或本博客的问题...',
    'ai.clear': '清除',
    'ai.stop': '停止',
    'ai.error': '抱歉，出了点问题。请重试。',
    'ai.sources': '引用来源',
    'ai.disclaimer': 'AI 生成，仅供参考',

    // Command Menu
    'cmd.search': '搜索...',
    'cmd.noResults': '未找到结果。',
    'cmd.pages': '页面',
    'cmd.easterEgg': '彩蛋',
    'cmd.surprise': '惊喜',
    'cmd.posts': '文章',
    'cmd.categories': '分类',
    'cmd.tags': '标签',
    'cmd.actions': '操作',
    'cmd.toggleTheme': '切换主题',
    'cmd.viewAll': '查看全部',
    'cmd.searchCategories': '搜索分类...',
    'cmd.searchTags': '搜索标签...',
    'cmd.allCategories': '所有分类',
    'cmd.allTags': '所有标签',

    // Archive
    'posts.loadEarlier': '加载更早的文章',
    'posts.articles': '篇文章',

    // Filter
    'filter.showing': '显示',
    'filter.matchingPosts': '篇匹配文章',
    'filter.clearAll': '清除全部',
    'filter.noResults': '没有匹配的文章。',
    'filter.tryClearing': '试试清除部分筛选条件。',

    // Misc
    'misc.backToHome': '返回首页',

    // Post Detail
    'post.backToPosts': '返回文章列表',
    'post.aiSummary': 'AI 摘要',
    'post.moreArticles': '更多文章',
    'post.relatedArticles': '相关文章',
    'post.latestArticles': '最新文章'
  },
  'ja': {
    // Navigation
    'nav.home': 'ホーム',
    'nav.posts': '記事',
    'nav.about': 'について',
    'nav.search': '検索',

    // Home
    'home.subtitle': 'AI | シンプル｜ポスト言語時代のエンジニア',
    'home.recentPosts': '最新記事',
    'home.viewAll': 'すべて見る',

    // Posts
    'posts.title': '記事',

    // About
    'about.tab.about': 'について',
    'about.tab.now': '今',
    'about.tab.uses': 'ツール',
    'about.tab.links': 'リ���ク',
    'about.stacks': 'スキル・技術スタック',
    'about.projects': 'プロジェクト・貢献',
    'about.philosophy': '理念',
    'about.connect': '連絡する',
    'about.connect.description': '面白い会話やコラボレーションを歓迎します。',

    // Now
    'now.location': 'リモート',
    'now.updated': '更新日',
    'now.description': 'Nowページは、現在の人生で何に集中しているかを伝えます。',
    'now.focus': '現在���フォーカス',
    'now.learning': '学習中',
    'now.building': '構築中',
    'now.thinking': '考えていること',

    // Uses

    // Friends
    'links.description': 'おすすめのブログとリソース。',
    'links.apply': 'リンク交換しませんか？',
    'links.apply.description': 'ブログをお持ちでリンク交換を希望される場合は、お気軽にご連絡ください！',

    // AI
    'ai.title': 'AIに質問',
    'ai.subtitle': 'ブログやAIについて質問がありますか？どうぞ。',
    'ai.placeholder': 'AI、プログラミング、このブログについて何でも聞いてください...',
    'ai.clear': 'クリア',
    'ai.stop': '停止',
    'ai.error': '申し訳ありません、エラーが発生しました。再試行してください。',
    'ai.sources': '参照記事',
    'ai.disclaimer': 'AI生成、参考程度に',

    // Command Menu
    'cmd.search': '検索...',
    'cmd.noResults': '結果が見つかりません。',
    'cmd.pages': 'ページ',
    'cmd.easterEgg': 'イースターエッグ',
    'cmd.surprise': 'サプライズ',
    'cmd.posts': '記事',
    'cmd.categories': 'カテゴリー',
    'cmd.tags': 'タグ',
    'cmd.actions': 'ア��ション',
    'cmd.toggleTheme': 'テーマを切り替え',
    'cmd.viewAll': 'すべて表示',
    'cmd.searchCategories': 'カテゴリーを検索...',
    'cmd.searchTags': 'タグを検索...',
    'cmd.allCategories': 'すべてのカテゴリー',
    'cmd.allTags': 'すべてのタグ',

    // Archive
    'posts.loadEarlier': '以前の記事を読み込む',
    'posts.articles': '件の記事',

    // Filter
    'filter.showing': '表示中',
    'filter.matchingPosts': '件の一致する記事',
    'filter.clearAll': 'すべてクリア',
    'filter.noResults': '一致する記事がありません。',
    'filter.tryClearing': 'フィルターをクリアしてみてください。',

    // Misc
    'misc.backToHome': 'ホームに戻る',

    // Post Detail
    'post.backToPosts': '記事一覧に戻る',
    'post.aiSummary': 'AI要約',
    'post.moreArticles': 'もっと読む',
    'post.relatedArticles': '関連記事',
    'post.latestArticles': '最新記事'
  },
}

export function t(key: string, locale: Locale): string {
  return translations[locale][key] || translations['en'][key] || key
}

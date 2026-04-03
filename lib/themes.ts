export type ThemeStyle = 'gruvbox' | 'gruvbox-soft' | 'gruvbox-high-contrast' | 'catppuccin'
export type ThemeMode = 'light' | 'dark'

export interface ThemeConfig {
  style: ThemeStyle
  mode: ThemeMode
}

export interface ThemeStyleOption {
  value: ThemeStyle
  label: string
  description: string
  family: 'gruvbox' | 'catppuccin'
}

export const themeStyles: ThemeStyleOption[] = [
  { 
    value: 'gruvbox', 
    label: 'Gruvbox',
    description: 'Classic warm retro',
    family: 'gruvbox',
  },
  { 
    value: 'gruvbox-soft', 
    label: 'Gruvbox Soft',
    description: 'Lower contrast, easier on eyes',
    family: 'gruvbox',
  },
  { 
    value: 'gruvbox-high-contrast', 
    label: 'Gruvbox HC',
    description: 'Maximum readability',
    family: 'gruvbox',
  },
  { 
    value: 'catppuccin', 
    label: 'Catppuccin',
    description: 'Soothing pastel palette',
    family: 'catppuccin',
  },
]

// Prose semantic colors for markdown rendering
// Each theme has carefully crafted colors for different semantic elements
export interface ProseColors {
  // Headings (6 levels with decreasing visual weight)
  h1: string
  h2: string
  h3: string
  h4: string
  h5: string
  h6: string
  // Text emphasis
  bold: string
  italic: string
  // Interactive elements
  link: string
  linkHover: string
  // Code
  inlineCode: string
  inlineCodeBg: string
  // Quotes
  quoteBorder: string
  quoteText: string
  quoteBg: string
  // Lists
  listMarker: string
  // Dividers
  hr: string
}

export const proseColors: Record<ThemeStyle, Record<ThemeMode, ProseColors>> = {
  // Gruvbox Original
  // Headings: ALL levels have unique grayscale values
  gruvbox: {
    light: {
      // Headings: each level distinct grayscale
      h1: '#3c3836',     // Foreground 100%
      h2: '#45403d',     // Foreground 97%
      h3: '#504945',     // Foreground 92%
      h4: '#5d5550',     // Foreground 85%
      h5: '#6b625b',     // Foreground 75% (weakened)
      h6: '#7c6f64',     // Muted-foreground 60%
      // Text emphasis
      bold: '#3c3836',   // 与正文相同，仅靠字重区分
      italic: '#7c6f64', // Muted-foreground (比正文略弱)
      // Interactive
      link: '#d65d0e',   // Primary
      linkHover: '#af3a03', // Primary darker
      // Code - 与正文同色，仅靠微弱背景区分
      inlineCode: '#3c3836',
      inlineCodeBg: 'rgba(60, 56, 54, 0.08)',
      // Quotes
      quoteBorder: '#d65d0e', // Primary
      quoteText: '#7c6f64',   // 与 italic 相同
      quoteBg: 'rgba(214, 93, 14, 0.04)', // Primary 4%
      // Lists
      listMarker: '#d65d0e', // Primary
      // Dividers
      hr: '#d5c4a1',     // Border color
    },
    dark: {
      // Headings: each level distinct grayscale
      h1: '#ebdbb2',     // Foreground 100%
      h2: '#e2d3ab',     // Foreground 97%
      h3: '#d5c4a1',     // Foreground 92%
      h4: '#c4b593',     // Foreground 85%
      h5: '#b0a38c',     // Foreground 75% (weakened)
      h6: '#928374',     // Muted-foreground 60%
      // Text emphasis
      bold: '#ebdbb2',   // 与正文相同，仅靠字重区分
      italic: '#a89984', // Muted-foreground (比正文略弱)
      // Interactive
      link: '#fe8019',   // Primary
      linkHover: '#fabd2f', // Accent
      // Code - 与正文同色，仅靠微弱背景区分
      inlineCode: '#ebdbb2',
      inlineCodeBg: 'rgba(235, 219, 178, 0.1)',
      // Quotes
      quoteBorder: '#fe8019', // Primary
      quoteText: '#a89984',   // Muted foreground
      quoteBg: 'rgba(254, 128, 25, 0.04)', // Primary 4%
      // Lists
      listMarker: '#fe8019', // Primary
      // Dividers
      hr: '#504945',     // Border color
    },
  },

  // Gruvbox Soft
  'gruvbox-soft': {
    light: {
      h1: '#504945',     // Foreground 100%
      h2: '#575049',     // Foreground 97%
      h3: '#605851',     // Foreground 92%
      h4: '#6b625a',     // Foreground 85%
      h5: '#786e65',     // Foreground 75%
      h6: '#928374',     // Muted-foreground 60%
      bold: '#504945',   // 与正文相同，仅靠字重区分
      italic: '#7c6f64', // Muted-foreground
      link: '#af3a03',   // Primary
      linkHover: '#9d0006', // Darker
      inlineCode: '#504945', // 与正文同色
      inlineCodeBg: 'rgba(80, 73, 69, 0.08)',
      quoteBorder: '#af3a03', // Primary
      quoteText: '#7c6f64',   // Muted foreground
      quoteBg: 'rgba(175, 58, 3, 0.04)', // Primary 4%
      listMarker: '#af3a03', // Primary
      hr: '#bdae93',     // Border
    },
    dark: {
      h1: '#d5c4a1',     // Foreground 100%
      h2: '#cdbd9b',     // Foreground 97%
      h3: '#c4b594',     // Foreground 92%
      h4: '#b8ab8a',     // Foreground 85%
      h5: '#a89e82',     // Foreground 75%
      h6: '#928374',     // Muted-foreground 60%
      bold: '#d5c4a1',   // 与正文相同，仅靠字重区分
      italic: '#928374', // Muted-foreground
      link: '#d65d0e',   // Primary
      linkHover: '#d79921', // Accent
      inlineCode: '#d5c4a1', // 与正文同色
      inlineCodeBg: 'rgba(213, 196, 161, 0.1)',
      quoteBorder: '#d65d0e', // Primary
      quoteText: '#928374',   // Muted foreground
      quoteBg: 'rgba(214, 93, 14, 0.04)', // Primary 4%
      listMarker: '#d65d0e', // Primary
      hr: '#504945',     // Border
    },
  },

  // Gruvbox High Contrast
  'gruvbox-high-contrast': {
    light: {
      h1: '#1d2021',     // Foreground 100% (maximum contrast)
      h2: '#242525',     // Foreground 97%
      h3: '#2e2e2d',     // Foreground 92%
      h4: '#3c3836',     // Foreground 85%
      h5: '#4a4543',     // Foreground 75%
      h6: '#5d5754',     // Muted-foreground 60%
      bold: '#1d2021',   // 与正文相同，仅靠字重区分
      italic: '#504945', // Muted-foreground
      link: '#9d0006',   // Primary
      linkHover: '#cc241d', // Brighter
      inlineCode: '#1d2021', // 与正文同色
      inlineCodeBg: 'rgba(29, 32, 33, 0.08)',
      quoteBorder: '#9d0006', // Primary
      quoteText: '#504945',   // Darker for contrast
      quoteBg: 'rgba(157, 0, 6, 0.04)', // Primary 4%
      listMarker: '#9d0006', // Primary
      hr: '#bdae93',     // Border
    },
    dark: {
      h1: '#fbf1c7',     // Foreground 100% (maximum contrast)
      h2: '#f3eac1',     // Foreground 97%
      h3: '#e8dfb5',     // Foreground 92%
      h4: '#d9d0a6',     // Foreground 85%
      h5: '#c7bf98',     // Foreground 75%
      h6: '#b0a88c',     // Muted-foreground 60%
      bold: '#fbf1c7',   // 与正文相同，仅靠字重区分
      italic: '#bdae93', // Muted-foreground
      link: '#fe8019',   // Primary
      linkHover: '#fabd2f', // Accent
      inlineCode: '#fbf1c7', // 与正文同色
      inlineCodeBg: 'rgba(251, 241, 199, 0.1)',
      quoteBorder: '#fe8019', // Primary
      quoteText: '#bdae93',   // Brighter for contrast
      quoteBg: 'rgba(254, 128, 25, 0.05)', // Primary 5%
      listMarker: '#fe8019', // Primary
      hr: '#504945',     // Border
    },
  },

  // Catppuccin
  catppuccin: {
    light: {
      // Catppuccin Latte - each level distinct
      h1: '#4c4f69',     // Text 100%
      h2: '#535671',     // Text 97%
      h3: '#5c5f77',     // Subtext 1 (92%)
      h4: '#64677e',     // Subtext blend (85%)
      h5: '#6c6f85',     // Subtext 0 (75%)
      h6: '#8c8fa1',     // Overlay 1 (60%)
      bold: '#4c4f69',   // 与正文相同，仅靠字重区分
      italic: '#6c6f85', // Subtext 0 (比正文略弱)
      link: '#8839ef',   // Mauve
      linkHover: '#ea76cb', // Pink
      inlineCode: '#4c4f69', // ��正文同色
      inlineCodeBg: 'rgba(76, 79, 105, 0.08)',
      quoteBorder: '#8839ef', // Mauve
      quoteText: '#6c6f85',   // Subtext 0
      quoteBg: 'rgba(136, 57, 239, 0.04)', // Mauve 4%
      listMarker: '#8839ef', // Mauve
      hr: '#ccd0da',     // Surface 0
    },
    dark: {
      // Catppuccin Mocha - each level distinct
      h1: '#cdd6f4',     // Text 100%
      h2: '#c5ceec',     // Text 97%
      h3: '#bac2de',     // Subtext 1 (92%)
      h4: '#b0b8d1',     // Subtext blend (85%)
      h5: '#a6adc8',     // Subtext 0 (75%)
      h6: '#8b90a8',     // Overlay (60%)
      bold: '#cdd6f4',   // 与正文相同，仅靠字重区分
      italic: '#a6adc8', // Subtext 0 (比正文略弱)
      link: '#cba6f7',   // Mauve
      linkHover: '#f5c2e7', // Pink
      inlineCode: '#cdd6f4', // 与正文同色
      inlineCodeBg: 'rgba(205, 214, 244, 0.1)',
      quoteBorder: '#cba6f7', // Mauve
      quoteText: '#a6adc8',   // Subtext 0
      quoteBg: 'rgba(203, 166, 247, 0.04)', // Mauve 4%
      listMarker: '#cba6f7', // Mauve
      hr: '#45475a',     // Surface 0
    },
  },
}

// Helper function to generate prose CSS variables from ProseColors
function generateProseVariables(style: ThemeStyle, mode: ThemeMode): Record<string, string> {
  const colors = proseColors[style][mode]
  return {
    '--prose-h1': colors.h1,
    '--prose-h2': colors.h2,
    '--prose-h3': colors.h3,
    '--prose-h4': colors.h4,
    '--prose-h5': colors.h5,
    '--prose-h6': colors.h6,
    '--prose-bold': colors.bold,
    '--prose-italic': colors.italic,
    '--prose-link': colors.link,
    '--prose-link-hover': colors.linkHover,
    '--prose-inline-code': colors.inlineCode,
    '--prose-inline-code-bg': colors.inlineCodeBg,
    '--prose-quote-border': colors.quoteBorder,
    '--prose-quote-text': colors.quoteText,
    '--prose-quote-bg': colors.quoteBg,
    '--prose-list-marker': colors.listMarker,
    '--prose-hr': colors.hr,
  }
}

// CSS custom properties for each theme
export const themeVariables: Record<ThemeStyle, Record<ThemeMode, Record<string, string>>> = {
  // Gruvbox Original
  gruvbox: {
    light: {
      '--background': '#fbf1c7',
      '--foreground': '#3c3836',
      '--card': '#f9f5d7',
      '--card-foreground': '#3c3836',
      '--popover': '#f9f5d7',
      '--popover-foreground': '#3c3836',
      '--primary': '#d65d0e',
      '--primary-foreground': '#fbf1c7',
      '--secondary': '#ebdbb2',
      '--secondary-foreground': '#3c3836',
      '--muted': '#d5c4a1',
      '--muted-foreground': '#665c54',
      '--accent': '#b57614',
      '--accent-foreground': '#fbf1c7',
      '--destructive': '#cc241d',
      '--destructive-foreground': '#fbf1c7',
      '--border': '#d5c4a1',
      '--input': '#ebdbb2',
      '--ring': '#d65d0e',
      '--chart-1': '#cc241d',
      '--chart-2': '#98971a',
      '--chart-3': '#458588',
      '--chart-4': '#b16286',
      '--chart-5': '#d79921',
      // Prose semantic colors
      ...generateProseVariables('gruvbox', 'light'),
    },
    dark: {
      '--background': '#282828',
      '--foreground': '#ebdbb2',
      '--card': '#3c3836',
      '--card-foreground': '#ebdbb2',
      '--popover': '#3c3836',
      '--popover-foreground': '#ebdbb2',
      '--primary': '#fe8019',
      '--primary-foreground': '#282828',
      '--secondary': '#504945',
      '--secondary-foreground': '#ebdbb2',
      '--muted': '#504945',
      '--muted-foreground': '#a89984',
      '--accent': '#fabd2f',
      '--accent-foreground': '#282828',
      '--destructive': '#fb4934',
      '--destructive-foreground': '#282828',
      '--border': '#504945',
      '--input': '#504945',
      '--ring': '#fe8019',
      '--chart-1': '#fb4934',
      '--chart-2': '#b8bb26',
      '--chart-3': '#83a598',
      '--chart-4': '#d3869b',
      '--chart-5': '#fabd2f',
      // Prose semantic colors
      ...generateProseVariables('gruvbox', 'dark'),
    },
  },

  // Gruvbox Soft - Lower contrast, softer colors
  'gruvbox-soft': {
    light: {
      '--background': '#f2e5bc',
      '--foreground': '#504945',
      '--card': '#ebdbb2',
      '--card-foreground': '#504945',
      '--popover': '#ebdbb2',
      '--popover-foreground': '#504945',
      '--primary': '#af3a03',
      '--primary-foreground': '#f2e5bc',
      '--secondary': '#d5c4a1',
      '--secondary-foreground': '#504945',
      '--muted': '#d5c4a1',
      '--muted-foreground': '#7c6f64',
      '--accent': '#b57614',
      '--accent-foreground': '#f2e5bc',
      '--destructive': '#9d0006',
      '--destructive-foreground': '#f2e5bc',
      '--border': '#bdae93',
      '--input': '#d5c4a1',
      '--ring': '#af3a03',
      '--chart-1': '#9d0006',
      '--chart-2': '#79740e',
      '--chart-3': '#076678',
      '--chart-4': '#8f3f71',
      '--chart-5': '#b57614',
      ...generateProseVariables('gruvbox-soft', 'light'),
    },
    dark: {
      '--background': '#32302f',
      '--foreground': '#d5c4a1',
      '--card': '#3c3836',
      '--card-foreground': '#d5c4a1',
      '--popover': '#3c3836',
      '--popover-foreground': '#d5c4a1',
      '--primary': '#d65d0e',
      '--primary-foreground': '#32302f',
      '--secondary': '#504945',
      '--secondary-foreground': '#d5c4a1',
      '--muted': '#504945',
      '--muted-foreground': '#928374',
      '--accent': '#d79921',
      '--accent-foreground': '#32302f',
      '--destructive': '#cc241d',
      '--destructive-foreground': '#32302f',
      '--border': '#504945',
      '--input': '#504945',
      '--ring': '#d65d0e',
      '--chart-1': '#cc241d',
      '--chart-2': '#98971a',
      '--chart-3': '#458588',
      '--chart-4': '#b16286',
      '--chart-5': '#d79921',
      ...generateProseVariables('gruvbox-soft', 'dark'),
    },
  },

  // Gruvbox High Contrast - Maximum readability
  'gruvbox-high-contrast': {
    light: {
      '--background': '#f9f5d7',
      '--foreground': '#1d2021',
      '--card': '#fbf1c7',
      '--card-foreground': '#1d2021',
      '--popover': '#fbf1c7',
      '--popover-foreground': '#1d2021',
      '--primary': '#9d0006',
      '--primary-foreground': '#f9f5d7',
      '--secondary': '#ebdbb2',
      '--secondary-foreground': '#1d2021',
      '--muted': '#d5c4a1',
      '--muted-foreground': '#504945',
      '--accent': '#b57614',
      '--accent-foreground': '#f9f5d7',
      '--destructive': '#9d0006',
      '--destructive-foreground': '#f9f5d7',
      '--border': '#bdae93',
      '--input': '#ebdbb2',
      '--ring': '#9d0006',
      '--chart-1': '#9d0006',
      '--chart-2': '#79740e',
      '--chart-3': '#076678',
      '--chart-4': '#8f3f71',
      '--chart-5': '#b57614',
      ...generateProseVariables('gruvbox-high-contrast', 'light'),
    },
    dark: {
      '--background': '#1d2021',
      '--foreground': '#fbf1c7',
      '--card': '#282828',
      '--card-foreground': '#fbf1c7',
      '--popover': '#282828',
      '--popover-foreground': '#fbf1c7',
      '--primary': '#fe8019',
      '--primary-foreground': '#1d2021',
      '--secondary': '#3c3836',
      '--secondary-foreground': '#fbf1c7',
      '--muted': '#3c3836',
      '--muted-foreground': '#bdae93',
      '--accent': '#fabd2f',
      '--accent-foreground': '#1d2021',
      '--destructive': '#fb4934',
      '--destructive-foreground': '#1d2021',
      '--border': '#504945',
      '--input': '#3c3836',
      '--ring': '#fe8019',
      '--chart-1': '#fb4934',
      '--chart-2': '#b8bb26',
      '--chart-3': '#83a598',
      '--chart-4': '#d3869b',
      '--chart-5': '#fabd2f',
      ...generateProseVariables('gruvbox-high-contrast', 'dark'),
    },
  },

  // Catppuccin - Soothing pastel palette
  catppuccin: {
    light: {
      // Catppuccin Latte
      '--background': '#eff1f5',
      '--foreground': '#4c4f69',
      '--card': '#e6e9ef',
      '--card-foreground': '#4c4f69',
      '--popover': '#e6e9ef',
      '--popover-foreground': '#4c4f69',
      '--primary': '#8839ef',
      '--primary-foreground': '#eff1f5',
      '--secondary': '#ccd0da',
      '--secondary-foreground': '#4c4f69',
      '--muted': '#dce0e8',
      '--muted-foreground': '#6c6f85',
      '--accent': '#ea76cb',
      '--accent-foreground': '#eff1f5',
      '--destructive': '#d20f39',
      '--destructive-foreground': '#eff1f5',
      '--border': '#ccd0da',
      '--input': '#ccd0da',
      '--ring': '#8839ef',
      '--chart-1': '#d20f39',
      '--chart-2': '#40a02b',
      '--chart-3': '#1e66f5',
      '--chart-4': '#ea76cb',
      '--chart-5': '#df8e1d',
      ...generateProseVariables('catppuccin', 'light'),
    },
    dark: {
      // Catppuccin Mocha
      '--background': '#1e1e2e',
      '--foreground': '#cdd6f4',
      '--card': '#313244',
      '--card-foreground': '#cdd6f4',
      '--popover': '#313244',
      '--popover-foreground': '#cdd6f4',
      '--primary': '#cba6f7',
      '--primary-foreground': '#1e1e2e',
      '--secondary': '#45475a',
      '--secondary-foreground': '#cdd6f4',
      '--muted': '#45475a',
      '--muted-foreground': '#a6adc8',
      '--accent': '#f5c2e7',
      '--accent-foreground': '#1e1e2e',
      '--destructive': '#f38ba8',
      '--destructive-foreground': '#1e1e2e',
      '--border': '#45475a',
      '--input': '#45475a',
      '--ring': '#cba6f7',
      '--chart-1': '#f38ba8',
      '--chart-2': '#a6e3a1',
      '--chart-3': '#89b4fa',
      '--chart-4': '#f5c2e7',
      '--chart-5': '#f9e2af',
      ...generateProseVariables('catppuccin', 'dark'),
    },
  },
}

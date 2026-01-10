// Ambient type declaration for the `command-score` npm package, which ships
// without its own .d.ts file. Source: https://github.com/hood/command-score
//
// The package exports a single default function that fuzzy-scores a string
// against an abbreviation, returning a number between 0 (no match) and 1
// (perfect match). An optional `aliases` array lets a single target match
// multiple search strings.
declare module 'command-score' {
  export default function commandScore(
    string: string,
    abbreviation: string,
    aliases?: readonly string[],
  ): number
}

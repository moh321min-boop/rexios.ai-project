import type { ReactNode } from 'react'
// Small, deliberately limited Markdown renderer. Raw HTML is always escaped by React.
function inline(text: string): ReactNode[] {
  return text.split(/(\[[^\]]+\]\([^\s)]+\))/g).map((part, i) => {
    const match = /^\[([^\]]+)\]\(([^\s)]+)\)$/.exec(part)
    if (match && /^https?:\/\//i.test(match[2]!))
      return (
        <a key={i} className="text-link underline" href={match[2]} target="_blank" rel="noreferrer">
          {match[1]}
        </a>
      )
    return part
  })
}
export function FormattedText({ text }: { text: string }) {
  return (
    <div className="formatted-text" dir="auto">
      {text
        .split(/(```[^]*?```)/g)
        .filter(Boolean)
        .map((block, i) => {
          if (block.startsWith('```') && block.endsWith('```'))
            return (
              <pre key={i} className="code-block">
                <code>
                  {block
                    .slice(3, -3)
                    .replace(/^\w*\n/, '')
                    .replace(/\n$/, '')}
                </code>
              </pre>
            )
          return block
            .split(/\n\s*\n/)
            .filter(Boolean)
            .map((paragraph, j) =>
              /^- /m.test(paragraph) &&
              paragraph
                .trim()
                .split('\n')
                .every((line) => line.startsWith('- ')) ? (
                <ul key={`${i}-${j}`}>
                  {paragraph
                    .trim()
                    .split('\n')
                    .map((line, k) => (
                      <li key={k}>{inline(line.slice(2))}</li>
                    ))}
                </ul>
              ) : (
                <p key={`${i}-${j}`}>{inline(paragraph)}</p>
              )
            )
        })}
    </div>
  )
}

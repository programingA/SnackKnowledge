import ReactMarkdown from 'react-markdown'
import { aiMarkdownOptions, normalizeAiMarkdown } from './aiMarkdown'
import 'katex/dist/katex.min.css'

const components = {
  table: ({ children }) => (
    <div className="ai-markdown-table" tabIndex={0} role="region" aria-label="표">
      <table>{children}</table>
    </div>
  ),
}

export default function AiResponseText({ text, className = '' }) {
  return (
    <div className={`ai-response-text ${className}`.trim()}>
      <ReactMarkdown {...aiMarkdownOptions} components={components}>
        {normalizeAiMarkdown(text ?? '')}
      </ReactMarkdown>
    </div>
  )
}

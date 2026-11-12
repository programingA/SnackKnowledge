import ReactMarkdown from 'react-markdown'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import 'katex/dist/katex.min.css'

const protectedCode = /(^[ \t]*(`{3,}|~{3,})[^\r\n]*\r?\n[\s\S]*?^[ \t]*\2[ \t]*$|(`+)[^\r\n]*?\3)/gm

function normalizeMath(text) {
  return text.replace(/\\{1,2}\[([\s\S]+?)\\{1,2}\]|\\{1,2}\(([^\r\n]+?)\\{1,2}\)/g,
    (_, block, inline) => block !== undefined
      ? '\n\n$$\n' + block.trim() + '\n$$\n\n'
      : '$' + inline.trim() + '$')
}

function normalizeMarkdown(text) {
  let result = ''
  let cursor = 0

  for (const match of text.matchAll(protectedCode)) {
    result += normalizeMath(text.slice(cursor, match.index)) + match[0]
    cursor = match.index + match[0].length
  }

  return result + normalizeMath(text.slice(cursor))
}

const mathPlugins = [[rehypeKatex, { trust: false, maxSize: 20, strict: 'ignore' }]]

export default function AiResponseText({ text }) {
  return (
    <div className="ai-response-text">
      <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={mathPlugins} skipHtml disallowedElements={['img']}>
        {normalizeMarkdown(text ?? '')}
      </ReactMarkdown>
    </div>
  )
}

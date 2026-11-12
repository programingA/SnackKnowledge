import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'

const protectedCode = /(^[ \t]*(`{3,}|~{3,})[^\r\n]*\r?\n[\s\S]*?^[ \t]*\2[ \t]*$|(`+)[^\r\n]*?\3)/gm
const fenceStart = /^[ \t]{0,3}(`{3,}|~{3,})/
const tableRow = /^[ \t]{0,3}\\?\|.*\|[ \t]*\\?[ \t]*$/
const tableDivider = /^[ \t]{0,3}\\?\|(?:[ \t]*:?-+:?[ \t]*\|)+[ \t]*\\?[ \t]*$/

function normalizeTableRow(line) {
  return line.replace(/^([ \t]{0,3})\\\|/, '$1|').replace(/\|[ \t]*\\[ \t]*$/, '|')
}

function normalizeTables(text) {
  const lines = text.split(/\r?\n/)
  let fence = null
  for (let index = 0; index < lines.length; index += 1) {
    const marker = lines[index].match(fenceStart)?.[1]
    if (marker) {
      if (!fence) fence = marker
      else if (marker[0] === fence[0] && marker.length >= fence.length) fence = null
      continue
    }
    if (fence || index === 0 || !tableDivider.test(lines[index]) || !tableRow.test(lines[index - 1])) continue

    lines[index - 1] = normalizeTableRow(lines[index - 1])
    lines[index] = normalizeTableRow(lines[index])
    while (index + 1 < lines.length && tableRow.test(lines[index + 1])) {
      index += 1
      lines[index] = normalizeTableRow(lines[index])
    }
  }
  return lines.join('\n')
}

function normalizeMath(text) {
  return text.replace(/\\{1,2}\[([\s\S]+?)\\{1,2}\]|\\{1,2}\(([^\r\n]+?)\\{1,2}\)/g,
    (_, block, inline) => block !== undefined
      ? '\n\n$$\n' + block.trim() + '\n$$\n\n'
      : '$' + inline.trim() + '$')
}

export function normalizeAiMarkdown(input) {
  const text = normalizeTables(input)
  let result = ''
  let cursor = 0

  for (const match of text.matchAll(protectedCode)) {
    result += normalizeMath(text.slice(cursor, match.index)) + match[0]
    cursor = match.index + match[0].length
  }

  return result + normalizeMath(text.slice(cursor))
}

export const aiMarkdownOptions = {
  remarkPlugins: [remarkGfm, remarkMath],
  rehypePlugins: [[rehypeKatex, { trust: false, maxSize: 20, strict: 'ignore' }]],
  skipHtml: true,
  disallowedElements: ['img'],
}

import test from 'node:test'
import assert from 'node:assert/strict'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import ReactMarkdown from 'react-markdown'
import { aiMarkdownOptions, normalizeAiMarkdown } from '../src/components/ui/aiMarkdown.js'

function render(text) {
  return renderToStaticMarkup(createElement(ReactMarkdown, aiMarkdownOptions, normalizeAiMarkdown(text)))
}

test('renders standard and escaped GFM tables without changing literal pipes inside cells', () => {
  const normal = '| 대역 | 특징 |\n| --- | --- |\n| 2.4GHz | 벽을 잘 통과해요. |'
  const escaped = '| 대역 | 특징 |\\\n\\|---|---|\\\n\\| 5GHz | `빠른 연결`과 A \\| B |'
  for (const text of [normal, escaped]) {
    const html = render(text)
    assert.match(html, /<table>/)
    assert.match(html, /<th>대역<\/th>/)
    assert.match(html, /<td>[25]/)
  }
  assert.match(render(escaped), /<code>빠른 연결<\/code>과 A \| B/)
})

test('renders headings, formatting, nested lists, quote, code and GFM task and strike markup', () => {
  const text = [
    '## 제목', '', '**굵게**와 *기울임*, ~~취소~~', '',
    '- 첫 항목', '  - 하위 항목', '', '1. 번호 항목', '',
    '> 인용문', '', '- [x] 완료', '- [ ] 남음', '',
    '---', '', '```js', 'const value = 1', '```',
  ].join('\n')
  const html = render(text)
  for (const tag of ['h2', 'strong', 'em', 'del', 'ul', 'ol', 'blockquote', 'pre', 'hr']) {
    assert.match(html, new RegExp('<' + tag + '\\b'))
  }
  assert.match(html, /type="checkbox"/)
  assert.match(html, /disabled=""/)
  assert.match(html, /class="language-js"/)
})

test('renders inline and block math while preserving math-like text and tables inside code', () => {
  const html = render([
    '파장은 \\(\\lambda\\)예요.', '', '\\[', 'I \\propto \\frac{1}{\\lambda^4}', '\\]', '',
    '```math', 'x^2', '```', '',
    '```text', '| 대역 | 특징 |\\', '\\|---|---|\\', '\\| 5GHz | 코드 |', '```', '',
    '`\\(literal\\)`',
  ].join('\n'))
  assert.equal((html.match(/class="katex"/g) ?? []).length, 3)
  assert.equal((html.match(/class="katex-display"/g) ?? []).length, 2)
  assert.doesNotMatch(html, /<table>/)
  assert.match(html, /<code>\\\(literal\\\)<\/code>/)
})

test('skips raw HTML, images, and script URLs', () => {
  const html = render('<script>alert(1)</script>\n\n![image](https://example.com/image.png)\n\n[링크](javascript:alert%281%29)')
  assert.doesNotMatch(html, /<script|<img|href="javascript:/i)
})

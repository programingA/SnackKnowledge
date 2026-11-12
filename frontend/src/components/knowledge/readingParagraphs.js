const sentenceSegmenter = typeof Intl.Segmenter === 'function'
  ? new Intl.Segmenter('ko', { granularity: 'sentence' })
  : null

export function getReadingParagraphs(content) {
  const text = content.trim()
  if (!text) return []

  const paragraphs = text.split(/\r?\n[ \t]*\r?\n(?:[ \t]*\r?\n)*/)
  if (paragraphs.length > 1 || text.includes('\n')) return paragraphs

  const sentences = sentenceSegmenter
    ? Array.from(sentenceSegmenter.segment(text), ({ segment }) => segment.trim())
    : text.split(/(?<=[.!?。！？])\s+/)
  const reading = sentences.slice(0, 1)

  for (let index = 1; index < sentences.length; index += 2) {
    reading.push(sentences.slice(index, index + 2).join(' '))
  }

  return reading
}

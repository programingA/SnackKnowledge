import { useState } from 'react'
import { getExplanationFeedback } from '../../api/knowledge'
import AiResponseText from '../ui/AiResponseText'

const MIN_LENGTH = 20
const MAX_LENGTH = 1500

export default function KnowledgeExplanationForm({ id, onComplete }) {
  const [explanation, setExplanation] = useState('')
  const [feedback, setFeedback] = useState('')
  const [error, setError] = useState('')
  const [sending, setSending] = useState(false)
  const text = explanation.trim()
  const length = Array.from(text).length
  const valid = length >= MIN_LENGTH && length <= MAX_LENGTH

  async function handleSubmit(event) {
    event.preventDefault()
    if (!valid || sending) return

    setSending(true)
    setFeedback('')
    setError('')
    try {
      const result = await getExplanationFeedback(id, text)
      if (!result?.trim()) throw new Error('피드백이 비어 있어요. 다시 시도해보세요.')
      setFeedback(result)
      onComplete?.('explanation')
    } catch (error) {
      setError(error.message)
    } finally {
      setSending(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <label htmlFor="knowledge-explanation">내 말로 설명하기</label>
      <textarea id="knowledge-explanation" rows={5} value={explanation}
        onChange={(event) => setExplanation(event.target.value)}
        placeholder="핵심 개념과 그 이유를 20자 이상 적어주세요."
        aria-describedby="knowledge-explanation-count"
        maxLength={MAX_LENGTH} disabled={sending} />
      <div className="form-bottom">
        <small id="knowledge-explanation-count">{length.toLocaleString('ko-KR')} / 1,500자</small>
        <button type="submit" className="primary-button" disabled={sending || !valid}>
          {sending ? '피드백을 만드는 중...' : '피드백 받기'}
        </button>
      </div>
      {error && <p role="alert">{error}</p>}
      {feedback && (
        <div className="response" role="status">
          <strong>AI 피드백</strong>
          <AiResponseText text={feedback} />
        </div>
      )}
    </form>
  )
}

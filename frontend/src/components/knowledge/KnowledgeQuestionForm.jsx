import { useEffect, useState } from 'react'
import { askKnowledgeQuestion, getKnowledgeConversation } from '../../api/knowledge'
import AiResponseText from '../ui/AiResponseText'

export default function KnowledgeQuestionForm({ id, onComplete }) {
  const [question, setQuestion] = useState('')
  const [conversation, setConversation] = useState(null)
  const [error, setError] = useState('')
  const [attempt, setAttempt] = useState(0)
  const [sending, setSending] = useState(false)
  const used = conversation?.turns.length ?? 0
  const limit = conversation?.limit ?? 5
  const finished = used >= limit

  useEffect(() => {
    const controller = new AbortController()
    getKnowledgeConversation(id, controller.signal).then(setConversation).catch((error) => {
      if (!controller.signal.aborted) setError(error.message)
    })
    return () => controller.abort()
  }, [id, attempt])

  async function handleSubmit(event) {
    event.preventDefault()
    const text = question.trim()
    if (!text || !conversation || finished || sending) return

    setSending(true)
    setError('')
    try {
      setConversation(await askKnowledgeQuestion(id, text))
      setQuestion('')
      onComplete?.('question')
    } catch (error) {
      setError(error.message)
      if (error.status === 429) {
        setConversation(null)
        setAttempt((value) => value + 1)
      }
    } finally {
      setSending(false)
    }
  }

  return (
    <section className="knowledge-chat" aria-labelledby="knowledge-chat-title">
      <div className="knowledge-chat-heading">
        <h3 id="knowledge-chat-title">AI에게 질문하기</h3>
        <p className="knowledge-question-count" role="status">{used} / {limit}회 · {limit - used}회 남음</p>
      </div>
      {!conversation && !error && <p role="status">이전 대화를 불러오는 중이에요.</p>}
      {used > 0 && (
        <ol className="knowledge-chat-turns" aria-label="AI와 나눈 대화">
          {conversation.turns.map((turn, index) => (
            <li key={index}>
              <div className="knowledge-chat-message knowledge-chat-user">
                <strong>나</strong>
                <p>{turn.question}</p>
              </div>
              <div className="knowledge-chat-message knowledge-chat-ai">
                <strong>AI 답변</strong>
                <AiResponseText text={turn.answer} />
              </div>
            </li>
          ))}
        </ol>
      )}
      <form onSubmit={handleSubmit}>
        <label htmlFor="knowledge-question">이 지식에 대해 궁금한 점</label>
        <div className="input-action">
          <input id="knowledge-question" value={question} maxLength={300}
            placeholder="예: 노을은 왜 붉은색인가요?"
            onChange={(event) => setQuestion(event.target.value)}
            disabled={!conversation || finished || sending} />
          <button type="submit" className="primary-button" disabled={!conversation || finished || sending || !question.trim()}>
            {sending ? '답변 생성 중...' : '질문하기'}
          </button>
        </div>
      </form>
      {finished && <p className="knowledge-chat-limit" role="status">이 카드의 질문 {limit}회를 모두 사용했어요. 더 이상 질문할 수 없어요.</p>}
      {error && !finished && <p role="alert">{error}</p>}
      {!conversation && error && (
        <div className="knowledge-actions">
          <button type="button" className="text-button" onClick={() => {
            setError('')
            setAttempt((value) => value + 1)
          }}>대화 다시 불러오기</button>
        </div>
      )}
    </section>
  )
}

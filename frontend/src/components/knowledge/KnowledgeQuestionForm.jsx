import { useEffect, useId, useRef, useState } from 'react'
import { askKnowledgeQuestion, getKnowledgeConversation } from '../../api/study'
import AiResponseText from '../ui/AiResponseText'
import GenerationProgress, { LoadingSpinner } from '../ui/GenerationProgress'

export default function KnowledgeQuestionForm({ studyPath, onComplete, active }) {
  const composerId = useId()
  const titleId = useId()
  const [question, setQuestion] = useState('')
  const [conversation, setConversation] = useState(null)
  const [error, setError] = useState('')
  const [attempt, setAttempt] = useState(0)
  const [sending, setSending] = useState(false)
  const used = conversation?.turns.length ?? 0
  const limit = conversation?.limit ?? 5
  const finished = used >= limit
  const log = useRef(null)

  useEffect(() => {
    if (active && (used || sending) && log.current) log.current.scrollTop = log.current.scrollHeight
  }, [active, sending, used])

  useEffect(() => {
    const controller = new AbortController()
    getKnowledgeConversation(studyPath, controller.signal).then(setConversation).catch((error) => {
      if (!controller.signal.aborted) setError(error.message)
    })
    return () => controller.abort()
  }, [studyPath, attempt])

  async function handleSubmit(event) {
    event.preventDefault()
    const text = question.trim()
    if (!text || !conversation || finished || sending) return

    setSending(true)
    setError('')
    try {
      setConversation(await askKnowledgeQuestion(studyPath, text))
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
    <section className="knowledge-chat" aria-labelledby={titleId}>
      <div className="knowledge-chat-heading">
        <h3 id={titleId}>AI에게 질문하기</h3>
        <p className="knowledge-question-count" role="status">{used} / {limit}회 · {limit - used}회 남음</p>
      </div>
      <div className="knowledge-chat-log" ref={log} role="log" aria-label="대화 기록" tabIndex={0}>
        {!conversation && !error && <p role="status">이전 대화를 불러오는 중이에요.</p>}
        {conversation && !used && <p className="knowledge-chat-empty">읽은 지식에서 궁금한 점을 질문해 보세요.</p>}
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
        {sending && (
          <div className="knowledge-chat-message knowledge-chat-ai knowledge-chat-loading">
            <GenerationProgress>AI가 답변을 작성하고 있어요.</GenerationProgress>
          </div>
        )}
      </div>
      {finished ? (
        <div className="knowledge-chat-locked" role="status">
          이 카드의 질문 {limit}회를 모두 사용했어요. 더 이상 질문할 수 없어요.
        </div>
      ) : (
        <form className="knowledge-chat-form" onSubmit={handleSubmit}>
          <label htmlFor={composerId}>이 지식에 대해 궁금한 점</label>
          <div className="input-action">
            <input id={composerId} value={question} maxLength={300}
              placeholder="예: 노을은 왜 붉은색인가요?"
              onChange={(event) => setQuestion(event.target.value)}
              disabled={!conversation || sending} />
            <button type="submit" className="primary-button" disabled={!conversation || sending || !question.trim()}>
              {sending && <LoadingSpinner />}
              {sending ? '답변 생성 중...' : '질문하기'}
            </button>
          </div>
        </form>
      )}
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

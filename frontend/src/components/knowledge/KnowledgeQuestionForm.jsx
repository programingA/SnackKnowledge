import { useState } from "react";
import { askKnowledgeQuestion } from "../../api/knowledge";

export default function KnowledgeQuestionForm({ id }) {
    const [question, setQuestion] = useState('')
    const [answer, setAnswer] = useState('')
    const [error, setError] = useState('')
    const [sending, setSending] = useState(false)

    async function handleSubmit(event) {
        event.preventDefault()
        const text = question.trim()
        if (!text || sending) return

        setSending(true)
        setAnswer('')
        setError('')

        try {
            const reply = await askKnowledgeQuestion(id, text)
            if (!reply?.trim()) {
                throw new Error('답변이 비어 있어요. 다시 질문해보세요.')
            }
            setAnswer(reply)
        } catch (error) {
            setError(error.message)
        } finally {
            setSending(false)
        }
    }

    return (
    <form onSubmit={handleSubmit}>
      <label htmlFor="knowledge-question">이 지식에 대해 궁금한 점</label>
      <div className="input-action">
        <input
          id="knowledge-question"
          value={question}
          onChange={event => setQuestion(event.target.value)}
          placeholder="예: 노을은 왜 붉은색인가요?"
          disabled={sending}
        />
        <button
          type="submit"
          className="primary-button"
          disabled={sending || !question.trim()}
        >
          {sending ? '답변 생성 중...' : '질문하기'}
        </button>
      </div>

      {error && <p role="alert">{error}</p>}
      {answer && (
        <div className="response" role="status">
          <strong>AI 답변</strong>
          <p style={{ whiteSpace: 'pre-wrap' }}>{answer}</p>
        </div>
      )}
    </form>
  )
}

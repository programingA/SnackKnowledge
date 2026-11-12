import { useState } from "react";
import { getExplanationFeedback } from "../../api/knowledge";
import AiResponseText from '../ui/AiResponseText'

export default function KnowledgeExplanationForm({ id, onComplete }) {
    const [explanation, setExplanation] = useState('')
    const [feedback, setFeedback] = useState('')
    const [error, setError] = useState('')
    const [sending, setSending] = useState(false)

    async function handleSubmit(event) {
        event.preventDefault()

        const text = explanation.trim()
        if (!text || sending) return

        setSending(true)
        setFeedback('')
        setError('')

        try {
            const result = await getExplanationFeedback(id, text)
            if (!result?.trim()) {
                throw new Error('피드백이 비어 있어요. 다시 시도해보세요.')
            }
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
            <textarea
                id="knowledge-explanation"
                rows={4}
                value={explanation}
                onChange={(event) => setExplanation(event.target.value)}
                disabled={sending}
            />
            <button
                type="submit"
                className="primary-button"
                disabled={sending || !explanation.trim()}
            >
                {sending ? '피드백을 만드는 중...' : '피드백 받기'}
            </button>

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

import { useEffect, useRef, useState } from 'react'
import { generateKnowledge } from '../../api/knowledge'
import GenerationProgress, { LoadingSpinner } from '../ui/GenerationProgress'
import Icon from '../ui/Icon'
import Modal from '../ui/Modal'

export default function SampleGenerateModal({ onClose, onGenerated }) {
  const [topic, setTopic] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const request = useRef(null)

  useEffect(() => () => request.current?.abort(), [])

  async function handleSubmit(event) {
    event.preventDefault()

    const trimmedTopic = topic.trim()
    if (!trimmedTopic || loading) return

    setLoading(true)
    setError('')
    const controller = new AbortController()
    request.current = controller

    try {
      const card = await generateKnowledge(trimmedTopic, controller.signal)
      if (!controller.signal.aborted) await onGenerated(card)
    } catch (error) {
      if (!controller.signal.aborted) setError(error.message)
    } finally {
      if (!controller.signal.aborted) setLoading(false)
    }
  }

  return (
    <Modal
      label="새 지식 만들기"
      onClose={onClose}
      dismissible={!loading}
      className="generate-modal"
    >
      <h2>새 지식 만들기</h2>

      <form onSubmit={handleSubmit}>
        <label htmlFor="topic">알고 싶은 주제</label>
        <input
          id="topic"
          value={topic}
          maxLength={100}
          onChange={(event) => setTopic(event.target.value)}
          placeholder="예: 블랙홀은 어떻게 생기나요?"
          disabled={loading}
          required
        />

        <fieldset className="topic-suggestions">
          <legend>예시 주제</legend>
          <div>
            {['하늘의 색', '와이파이의 원리', '달빛의 비밀'].map((suggestion) => (
              <button
                type="button"
                key={suggestion}
                onClick={() => setTopic(suggestion)}
                aria-pressed={topic === suggestion}
                disabled={loading}
              >
                {suggestion}
              </button>
            ))}
          </div>
        </fieldset>

        <button
          type="submit"
          className="primary-button full-width"
          disabled={loading || !topic.trim()}
        >
          {loading ? '생성 중…' : '지식 카드 만들기'}
          {loading ? <LoadingSpinner /> : <Icon name="arrow" size={18} strokeWidth={1.5} />}
        </button>
      </form>

      {loading && <GenerationProgress>카드 내용과 삽화를 준비하고 있어요.</GenerationProgress>}
      {error && <p role="alert">{error}</p>}
    </Modal>
  )
}

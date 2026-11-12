import { useEffect, useRef, useState } from 'react'
import { generateKnowledge } from '../../api/knowledge'
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
      if (!controller.signal.aborted) onGenerated(card)
    } catch (error) {
      if (!controller.signal.aborted) setError(error.message)
    } finally {
      if (!controller.signal.aborted) setLoading(false)
    }
  }

  return (
    <Modal
      label="새로운 지식 만들기"
      onClose={onClose}
      className="generate-modal"
    >
      <span className="large-icon">
        <Icon name="sparkle" size={29} />
      </span>
      <h2>오늘은 무엇이 궁금한가요?</h2>

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

        <div className="topic-suggestions">
          {['하늘의 색', '와이파이의 원리', '달빛의 비밀'].map((suggestion) => (
            <button
              type="button"
              key={suggestion}
              onClick={() => setTopic(suggestion)}
              disabled={loading}
            >
              {suggestion} +
            </button>
          ))}
        </div>

        <button
          type="submit"
          className="primary-button full-width"
          disabled={loading || !topic.trim()}
        >
          <Icon name="sparkle" size={17} />
          {loading ? '지식 카드를 만드는 중...' : '지식 카드 만들기'}
        </button>
      </form>

      {error && <p role="alert">{error}</p>}
    </Modal>
  )
}

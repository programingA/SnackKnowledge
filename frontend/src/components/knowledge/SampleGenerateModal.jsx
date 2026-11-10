import { useState } from 'react'
import { articles } from '../../data/sampleKnowledge'
import Icon from '../ui/Icon'
import Modal from '../ui/Modal'

export default function SampleGenerateModal({ onClose, onOpen }) {
  const [topic, setTopic] = useState('')
  const [result, setResult] = useState(false)
  return (
    <Modal
      label="새로운 지식 만들기"
      onClose={onClose}
      className="generate-modal"
    >
      <span className="large-icon">
        <Icon name="sparkle" size={29} />
      </span>
      <span className="eyebrow">FOLLOW YOUR CURIOSITY</span>
      <h2>오늘은 무엇이 궁금한가요?</h2>
      <p className="muted">작은 호기심 하나가 새로운 발견의 시작이에요.</p>
      <div className="demo-notice">
        현재는 샘플 체험입니다. 입력한 주제로 실제 콘텐츠를 생성하지 않습니다.
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          if (topic.trim()) setResult(true)
        }}
      >
        <label htmlFor="topic">알고 싶은 주제</label>
        <input
          id="topic"
          value={topic}
          maxLength={100}
          onChange={(e) => {
            setTopic(e.target.value)
            setResult(false)
          }}
          placeholder="예: 하늘은 왜 파란색일까?"
          required
        />
        <div className="topic-suggestions">
          {['하늘의 색', '와이파이의 원리', '달빛의 비밀'].map((t) => (
            <button
              type="button"
              key={t}
              onClick={() => {
                setTopic(t)
                setResult(false)
              }}
            >
              {t} +
            </button>
          ))}
        </div>
        <button
          type="submit"
          className="primary-button full-width"
          disabled={!topic.trim()}
        >
          <Icon name="sparkle" size={17} />
          샘플 결과 체험하기
          <Icon name="arrow" size={17} />
        </button>
      </form>
      {result && (
        <div className="response" role="status">
          <strong>이런 지식이 만들어질 거예요</strong>
          <p>
            입력한 주제와 별개로, 준비된 ‘하늘은 왜 파란색일까?’ 샘플을
            보여드려요.
          </p>
          <button className="text-button" onClick={() => onOpen(articles[0])}>
            샘플 지식 읽기
            <Icon name="arrow" size={16} />
          </button>
        </div>
      )}
    </Modal>
  )
}

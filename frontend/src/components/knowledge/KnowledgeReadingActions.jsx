import Icon from '../ui/Icon'

export default function KnowledgeReadingActions({ summary, onQuiz }) {
  return (
    <>
      <div className="takeaway">
        <Icon name="sparkle" />
        <div>
          <strong>이것만 기억해요</strong>
          <p>{summary}</p>
        </div>
      </div>
      <div className="knowledge-actions">
        <button type="button" className="primary-button" onClick={onQuiz} disabled={!onQuiz}>
          잘 이해했는지 확인해볼까요?
          <Icon name="arrow" size={17} />
        </button>
      </div>
    </>
  )
}

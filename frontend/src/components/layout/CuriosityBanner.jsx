import Icon from '../ui/Icon'

export default function CuriosityBanner({ onGenerate }) {
  return (
    <section className="curiosity-banner">
      <div>
        <h2>찾는 주제가 있나요?</h2>
        <p>궁금한 주제를 입력하면 AI가 읽을거리로 정리해요.</p>
      </div>
      <button type="button" className="primary-button" onClick={onGenerate}>
        새 지식 만들기
        <Icon name="arrow" size={18} strokeWidth={1.5} />
      </button>
    </section>
  )
}

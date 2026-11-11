import Icon from '../ui/Icon'

export default function CuriosityBanner({ onGenerate }) {
  return (
    <section className="curiosity-banner">
      <div className="banner-mark" aria-hidden="true">
        ✳
      </div>
      <div>
        <span className="eyebrow">LET CURIOSITY LEAD</span>
        <h2>찾는 지식이 없다면, 호기심을 꺼내보세요.</h2>
        <p>궁금한 주제를 입력하고 나만의 지식을 만나는 경험.</p>
      </div>
      <button className="primary-button" onClick={onGenerate}>
        <Icon name="sparkle" size={17} />새 지식 만들기
        <Icon name="arrow" size={17} />
      </button>
    </section>
  )
}

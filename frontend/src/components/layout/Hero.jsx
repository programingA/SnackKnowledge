import Icon from '../ui/Icon'

export default function Hero({ onBrowse, onRandom, featured, featuredStatus }) {
  const FeaturedCard = featured ? 'a' : 'div'
  return (
    <section className="hero" aria-labelledby="hero-title">
      <div className="hero-copy">
        <div className="hero-eyebrow">
          <span className="little-line" />A LITTLE KNOWLEDGE, EVERY DAY
        </div>
        <h1 id="hero-title">
          세상의 모든 호기심,
          <br />
          <span>한 입</span>이면 충분해요<span className="period">.</span>
        </h1>
        <p>
          몰랐던 세상이 가까워지는 시간.
          <br />
          짧게 읽고, 깊게 궁금해하고, 나만의 지식으로 만들어봐요.
        </p>
        <div className="hero-actions">
          <button className="primary-button" onClick={onBrowse}>
            오늘의 지식 만나기
            <Icon name="arrow" size={18} />
          </button>
          <button type="button" className="random-button" onClick={onRandom} disabled={!onRandom}>
            <Icon name="shuffle" size={18} />
            우연한 발견
          </button>
        </div>
        <div className="hero-footnote">
          <span className="small-spark">✳</span>하루 2분, 호기심을 채우는 작은
          습관
        </div>
      </div>
      <FeaturedCard
        className="featured-card"
        href={featured ? `#/knowledge/${featured.id}` : undefined}
        aria-label={featured ? `오늘의 한입: ${featured.title} 읽기` : undefined}
      >
        <div className="featured-top">
          <span>
            <span className="live-dot" />
            오늘의 한입
          </span>
        </div>
        <div className="sun-art" aria-hidden="true">
          <div className="orbit orbit-one" />
          <div className="orbit orbit-two" />
          <div className="sun-core">✳</div>
          <span className="art-dot dot-one" />
          <span className="art-dot dot-two" />
          <span className="art-star">✧</span>
          <span className="art-label">a little wonder</span>
        </div>
        <div className="featured-bottom">
          {featured ? (
            <>
              <div>
                <span>{featured.category}</span>
                <h2>{featured.title}</h2>
                <p className="featured-summary">{featured.summary}</p>
              </div>
              <span className="round-arrow">
                <Icon name="arrow" size={24} />
              </span>
            </>
          ) : <p role="status">{featuredStatus}</p>}
        </div>
      </FeaturedCard>
    </section>
  )
}

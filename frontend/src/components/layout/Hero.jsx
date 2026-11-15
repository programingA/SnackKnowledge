import Icon from '../ui/Icon'
import { getCategoryStyle } from '../../data/sampleKnowledge'
import BookmarkButton from '../knowledge/BookmarkButton'

export default function Hero({ onBrowse, onRandom, featured, featuredStatus, bookmarks }) {
  const FeaturedCard = featured ? 'a' : 'div'
  const categoryStyle = featured ? getCategoryStyle(featured.category) : null
  return (
    <section className="hero" aria-labelledby="hero-title">
      <div className="hero-copy">
        <h1 id="hero-title">
          일상의 궁금증을
          <br />
          한입지식으로
        </h1>
        <p>
          지식 카드로 짧게 읽고, 질문과 퀴즈로 이해를 확인해요.
        </p>
        <div className="hero-actions">
          <button type="button" className="primary-button" onClick={onBrowse}>
            지식 둘러보기
            <Icon name="arrow" size={18} strokeWidth={1.5} />
          </button>
          <button type="button" className="random-button" onClick={onRandom} disabled={!onRandom}>
            <Icon name="shuffle" size={18} strokeWidth={1.5} />
            우연한 발견
          </button>
        </div>
      </div>
      <div className="featured-entry">
        <FeaturedCard
          className="featured-card"
          href={featured ? `#/knowledge/${featured.id}` : undefined}
          aria-labelledby={featured ? 'featured-label featured-title' : undefined}
        >
          <p id="featured-label" className="featured-label">오늘의 한입</p>
          {featured ? (
            <>
              <div className="featured-preview">
                <div className="featured-copy">
                  <p className="featured-category">{featured.category}</p>
                  <h2 id="featured-title">{featured.title}</h2>
                  <p className="featured-summary">{featured.summary}</p>
                </div>
                <div className={`featured-topic tint-${categoryStyle.color} text-${categoryStyle.color}`} aria-hidden="true">
                  <Icon name={categoryStyle.icon === 'sparkle' ? 'book' : categoryStyle.icon} size={56} strokeWidth={1.25} />
                </div>
              </div>
              <span className="featured-read">
                한 입 읽기 <Icon name="arrow" size={18} strokeWidth={1.5} />
              </span>
            </>
          ) : <p className="featured-status" role="status">{featuredStatus}</p>}
        </FeaturedCard>
        {featured && bookmarks && <BookmarkButton card={featured} bookmarks={bookmarks} compact />}
      </div>
    </section>
  )
}

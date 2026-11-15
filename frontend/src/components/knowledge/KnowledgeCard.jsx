import Icon from '../ui/Icon'
import BookmarkButton from './BookmarkButton'

export default function KnowledgeCard({ card, bookmarks, href = `#/knowledge/${card.id}`, heading: Heading = 'h3' }) {
  return (
    <article className="knowledge-card">
      <div className="card-top">
        <span className="knowledge-card-category">{card.category}</span>
        {bookmarks && <BookmarkButton card={card} bookmarks={bookmarks} compact />}
      </div>
      <Heading><a className="knowledge-card-link" href={href}>{card.title}</a></Heading>
      <p>{card.summary}</p>
      <span className="card-read" aria-hidden="true">
        한 입 읽기 <Icon name="arrow" size={18} strokeWidth={1.5} />
      </span>
    </article>
  )
}

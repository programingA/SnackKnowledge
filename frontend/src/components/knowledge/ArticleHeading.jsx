import { getCategoryStyle } from '../../data/sampleKnowledge'
import Icon from '../ui/Icon'

export default function ArticleHeading({ category, title, summary, color, icon, backLink, children }) {
  const categoryStyle = getCategoryStyle(category)
  const tint = color ?? categoryStyle.color
  const categoryIcon = icon ?? categoryStyle.icon
  const categoryLabel = (
    <span className={`category-label text-${tint}`}>
      <Icon name={categoryIcon} size={17} />
      {category} 한 입
    </span>
  )

  return (
    <div className={`article-heading tint-${tint}`}>
      {backLink ? (
        <div className="article-category-row">
          <div className="saved-card-back">{backLink}</div>
          {categoryLabel}
        </div>
      ) : categoryLabel}
      <h1>{title}</h1>
      <p>{summary}</p>
      {children}
    </div>
  )
}

import { getCategoryStyle } from '../../data/sampleKnowledge'
import Icon from '../ui/Icon'

export default function ArticleHeading({ category, title, summary, color, icon, titleAction, children }) {
  const categoryStyle = getCategoryStyle(category)
  const tint = color ?? categoryStyle.color
  const categoryIcon = icon ?? categoryStyle.icon

  return (
    <div className={`article-heading tint-${tint}`}>
      <span className={`category-label text-${tint}`}>
        <Icon name={categoryIcon} size={17} />
        {category} 한 입
      </span>
      {titleAction ? (
        <div className="article-title-row">
          <h1>{title}</h1>
          {titleAction}
        </div>
      ) : <h1>{title}</h1>}
      <p>{summary}</p>
      {children}
    </div>
  )
}

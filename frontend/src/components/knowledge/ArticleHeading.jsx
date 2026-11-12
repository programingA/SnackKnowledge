import { articles } from '../../data/sampleKnowledge'
import Icon from '../ui/Icon'

export default function ArticleHeading({ category, title, summary, color, icon, children }) {
  const categoryStyle = articles.find((article) => article.category === category)
  const tint = color ?? categoryStyle?.color ?? 'blue'
  const categoryIcon = icon ?? categoryStyle?.icon ?? 'sparkle'

  return (
    <div className={`article-heading tint-${tint}`}>
      <span className={`category-label text-${tint}`}>
        <Icon name={categoryIcon} size={17} />
        {category} 한 입
      </span>
      <h1>{title}</h1>
      <p>{summary}</p>
      {children}
    </div>
  )
}

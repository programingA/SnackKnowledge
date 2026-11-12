import Icon from '../ui/Icon'

export default function ArticleHeading({ category, title, summary, color = 'blue', icon = 'sparkle', children }) {
  return (
    <div className={`article-heading tint-${color}`}>
      <span className={`category-label text-${color}`}>
        <Icon name={icon} size={17} />
        {category} 한 입
      </span>
      <h1>{title}</h1>
      <p>{summary}</p>
      {children}
    </div>
  )
}

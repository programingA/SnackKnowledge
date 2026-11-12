import { articles } from '../../data/sampleKnowledge'
import AiResponseText from '../ui/AiResponseText'
import ArticleHeading from './ArticleHeading'
import './GeneratedCards.css'

export default function GeneratedArticle({ card, showImageFallback = false, children }) {
  const categoryStyle = articles.find((article) => article.category === card.category)

  return (
    <article className="article-page-card generated-article" aria-label={card.title}>
      <ArticleHeading
        category={card.category}
        title={card.title}
        summary={card.summary}
        color={categoryStyle?.color}
        icon={categoryStyle?.icon}
      />
      <div className="article-tabs generated-reading-tabs">
        <h2>지식 읽기</h2>
      </div>
      <div className="article-body">
        {card.imageBase64 && (
          <img
            className="saved-generated-image"
            src={'data:image/webp;base64,' + card.imageBase64}
            alt={card.title + ' 주제 삽화'}
          />
        )}
        {showImageFallback && !card.imageBase64 && (
          <p>이미지를 생성하지 못했어요. 카드 내용은 아래에서 읽을 수 있어요.</p>
        )}
        <AiResponseText text={card.content} />
        {children}
      </div>
    </article>
  )
}

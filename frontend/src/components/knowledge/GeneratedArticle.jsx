import AiResponseText from '../ui/AiResponseText'
import ArticleHeading from './ArticleHeading'
import KnowledgeStudyTabs from './KnowledgeStudyTabs'
import { getReadingParagraphs } from './readingParagraphs'
import './GeneratedCards.css'

export default function GeneratedArticle({ card, studyPath, showStudy = Boolean(studyPath), showImageFallback = false, headerActions, children }) {
  const text = /[\n*_`\\$]/.test(card.content) ? card.content : getReadingParagraphs(card.content).join('\n\n')
  const reading = (
    <>
      {card.imageBase64 && (
        <img className="saved-generated-image knowledge-illustration"
          src={'data:image/webp;base64,' + card.imageBase64} alt={card.title + ' 주제 삽화'} />
      )}
      {showImageFallback && !card.imageBase64 && (
        <p>이미지를 생성하지 못했어요. 카드 내용은 아래에서 읽을 수 있어요.</p>
      )}
      <AiResponseText className="article-reading generated-article-reading" text={text} />
    </>
  )

  return (
    <article className="article-page-card generated-article study-article" aria-label={card.title}>
      <ArticleHeading category={card.category} title={card.title} summary={card.summary} />
      {headerActions && <div className="generated-preview-controls">{headerActions}</div>}
      {showStudy ? (
        <KnowledgeStudyTabs studyPath={studyPath} summary={card.summary} readingFooter={children}>
          {reading}
        </KnowledgeStudyTabs>
      ) : (
        <>
          <div className="article-tabs generated-reading-tabs"><h2>지식 읽기</h2></div>
          <div className="article-body">{reading}{children}</div>
        </>
      )}
    </article>
  )
}

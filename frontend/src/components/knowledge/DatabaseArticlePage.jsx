import { useEffect, useState } from 'react'
import { getKnowledge } from '../../api/knowledge'
import ArticleHeading from './ArticleHeading'
import BookmarkButton from './BookmarkButton'
import useLearningActivity from './useLearningActivity'
import KnowledgeStudyTabs from './KnowledgeStudyTabs'
import { getReadingParagraphs } from './readingParagraphs'

export default function DatabaseArticlePage({ id, username, bookmarks }) {
  const [knowledge, setKnowledge] = useState(null)
  const [error, setError] = useState('')
  const learning = useLearningActivity(id, username, Boolean(knowledge))
  const [imageUnavailable, setImageUnavailable] = useState(false)

  useEffect(() => {
    const controller = new AbortController()

    getKnowledge(id, controller.signal)
      .then((data) => setKnowledge(data))
      .catch((error) => {
        if (error.name !== 'AbortError') {
          setError(error.message)
        }
      })

    return () => controller.abort()
  }, [id])

  return (
    <article className="article-page-card study-article" aria-label={knowledge?.title ?? '지식 상세보기'}>
      {error && (
        <p className="article-body" role="alert">
          {error}
        </p>
      )}

      {!knowledge && !error && (
        <p className="article-body" role="status">본문을 불러오는 중...</p>
      )}

      {knowledge && (
        <>
          <ArticleHeading category={knowledge.category} title={knowledge.title} summary={knowledge.summary}>
            {bookmarks && <BookmarkButton key={username} card={knowledge} bookmarks={bookmarks} />}
          </ArticleHeading>
          <KnowledgeStudyTabs studyPath={`/api/knowledge/${id}`} summary={knowledge.summary}
            onComplete={learning.track} error={learning.error}>
            {!imageUnavailable && (
              <img className="knowledge-illustration" src={`/api/knowledge/${id}/image`}
                alt={knowledge.title + ' 주제 삽화'} onError={() => setImageUnavailable(true)} />
            )}
            <div className="article-reading">
              {getReadingParagraphs(knowledge.content).map((paragraph, index) => (
                <p key={index} className={index === 0 ? 'article-intro' : undefined}>
                  {paragraph}
                </p>
              ))}
            </div>
          </KnowledgeStudyTabs>
        </>
      )}
    </article>
  )
}


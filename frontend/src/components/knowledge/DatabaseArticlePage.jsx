import { useState } from 'react'
import { getKnowledge } from '../../api/knowledge'
import useApiQuery from '../../api/useApiQuery'
import LoadError from '../ui/LoadError'
import ArticleHeading from './ArticleHeading'
import BookmarkButton from './BookmarkButton'
import useLearningActivity from './useLearningActivity'
import KnowledgeStudyTabs from './KnowledgeStudyTabs'
import { getReadingParagraphs } from './readingParagraphs'

function loadKnowledge(signal, id) {
  return getKnowledge(id, signal)
}

export default function DatabaseArticlePage({ id, username, bookmarks }) {
  const { data: knowledge, error, retry } = useApiQuery(loadKnowledge, id)
  const learning = useLearningActivity(id, username, Boolean(knowledge))
  const [imageUnavailable, setImageUnavailable] = useState(false)

  return (
    <article className="article-page-card study-article" aria-label={knowledge?.title ?? '지식 상세보기'}>
      {error && (
        <LoadError heading="h1" message={error.status === 404 ? '지식 카드를 찾을 수 없어요.' : '지식 카드를 불러오지 못했어요.'}
          onRetry={retry} />
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


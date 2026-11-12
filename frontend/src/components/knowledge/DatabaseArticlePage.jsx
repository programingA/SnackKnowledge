import { useEffect, useState } from 'react'
import { getKnowledge } from '../../api/knowledge'
import ArticleHeading from './ArticleHeading'
import BookmarkButton from './BookmarkButton'
import useLearningActivity from './useLearningActivity'
import KnowledgeQuestionForm from './KnowledgeQuestionForm'
import KnowledgeQuiz from './KnowledgeQuiz'
import KnowledgeExplanationForm from './KnowledgeExplanationForm'

const activities = [
  ['read', '지식 읽기'],
  ['ask', 'AI에게 질문'],
  ['quiz', '퀴즈로 복습'],
  ['explain', '직접 설명하기'],
]

export default function DatabaseArticlePage({ id, username }) {
  const [knowledge, setKnowledge] = useState(null)
  const [error, setError] = useState('')
  const learning = useLearningActivity(id, username, Boolean(knowledge))
  const [activity, setActivity] = useState('read')

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
    <article className="article-page-card" aria-label={knowledge?.title ?? '지식 상세보기'}>
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
            {username && <BookmarkButton key={username} id={id} />}
          </ArticleHeading>
          <div className="article-tabs" role="group" aria-label="학습 활동">
            {activities.map(([value, label]) => (
              <button
                type="button"
                key={value}
                className={activity === value ? 'active' : ''}
                aria-pressed={activity === value}
                onClick={() => setActivity(value)}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="article-body">
            {learning.error && <p role="alert">{learning.error}</p>}
            {activity === 'read' && knowledge.content.split(/\r?\n[ \t]*\r?\n(?:[ \t]*\r?\n)*/).map((paragraph, index) => (
              <p key={index} className={index === 0 ? 'article-intro article-page-content' : 'article-page-content'}>
                {paragraph}
              </p>
            ))}
            <div hidden={activity !== 'ask'}>
              <KnowledgeQuestionForm id={id} onComplete={learning.track} />
            </div>
            <div hidden={activity !== 'quiz'}>
              <KnowledgeQuiz id={id} onComplete={learning.track} />
            </div>
            <div hidden={activity !== 'explain'}>
              <KnowledgeExplanationForm id={id} onComplete={learning.track} />
            </div>
          </div>
        </>
      )}
    </article>
  )
}

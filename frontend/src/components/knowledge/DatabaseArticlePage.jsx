import { useEffect, useRef, useState } from 'react'
import Icon from '../ui/Icon'
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

const sentenceSegmenter = typeof Intl.Segmenter === 'function'
  ? new Intl.Segmenter('ko', { granularity: 'sentence' })
  : null

function getReadingParagraphs(content) {
  const text = content.trim()
  if (!text) return []

  const paragraphs = text.split(/\r?\n[ \t]*\r?\n(?:[ \t]*\r?\n)*/)
  if (paragraphs.length > 1 || text.includes('\n')) return paragraphs

  const sentences = sentenceSegmenter
    ? Array.from(sentenceSegmenter.segment(text), ({ segment }) => segment.trim())
    : text.split(/(?<=[.!?。！？])\s+/)
  const reading = sentences.slice(0, 1)

  for (let index = 1; index < sentences.length; index += 2) {
    reading.push(sentences.slice(index, index + 2).join(' '))
  }

  return reading
}

export default function DatabaseArticlePage({ id, username }) {
  const [knowledge, setKnowledge] = useState(null)
  const [error, setError] = useState('')
  const learning = useLearningActivity(id, username, Boolean(knowledge))
  const [activity, setActivity] = useState('read')
  const [imageUnavailable, setImageUnavailable] = useState(false)
  const quizTab = useRef(null)

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
    <article className="article-page-card database-article" aria-label={knowledge?.title ?? '지식 상세보기'}>
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
                ref={value === 'quiz' ? quizTab : undefined}
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
            {activity === 'read' && (
              <>
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
                <div className="takeaway">
                  <Icon name="sparkle" />
                  <div>
                    <strong>이것만 기억해요</strong>
                    <p>{knowledge.summary}</p>
                  </div>
                </div>
                <div className="knowledge-actions">
                  <button type="button" className="primary-button" onClick={() => {
                    setActivity('quiz')
                    quizTab.current?.focus()
                  }}>
                    잘 이해했는지 확인해볼까요?
                    <Icon name="arrow" size={17} />
                  </button>
                </div>
              </>
            )}
            <div hidden={activity !== 'ask'}>
              <KnowledgeQuestionForm id={id} onComplete={learning.track} active={activity === 'ask'} />
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

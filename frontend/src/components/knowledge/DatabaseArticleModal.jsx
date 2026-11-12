import { useEffect, useState } from 'react'
import { getKnowledge } from '../../api/knowledge'
import BookmarkButton from './BookmarkButton'
import useLearningActivity from './useLearningActivity'
import KnowledgeQuestionForm from './KnowledgeQuestionForm'
import KnowledgeQuiz from './KnowledgeQuiz'
import KnowledgeExplanationForm from './KnowledgeExplanationForm'
import Modal from '../ui/Modal'

export default function DatabaseArticleModal({ id, username, onClose }) {
  const [knowledge, setKnowledge] = useState(null)
  const [error, setError] = useState('')
  const learning = useLearningActivity(id, username, Boolean(knowledge))

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
    <Modal label={knowledge?.title ?? '지식 상세보기'} onClose={onClose}>
      {error && (
        <p className="article-body" role="alert">
          {error}
        </p>
      )}

      {!knowledge && !error && (
        <p className="article-body">본문을 불러오는 중...</p>
      )}

      {knowledge && (
        <>
          <div className="article-heading tint-blue">
            <span className="category-label text-blue">
              {knowledge.category}
            </span>
            <h2>{knowledge.title}</h2>
            <p>{knowledge.summary}</p>
            {username && <BookmarkButton key={username} id={id} />}
          </div>
          <div className="article-body">
            <p>{knowledge.content}</p>
            {learning.error && <p role="alert">{learning.error}</p>}
            <KnowledgeQuestionForm id={id} onComplete={learning.track} />
            <KnowledgeQuiz id={id} onComplete={learning.track} />
            <KnowledgeExplanationForm key={id} id={id} onComplete={learning.track} />
          </div>
        </>
      )}
    </Modal>
  )
}

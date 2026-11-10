import { useEffect, useState } from 'react'
import { getKnowledge } from '../../api/knowledge'
import KnowledgeQuestionForm from './KnowledgeQuestionForm'
import Modal from '../ui/Modal'

export default function DatabaseArticleModal({ id, onClose }) {
  const [knowledge, setKnowledge] = useState(null)
  const [error, setError] = useState('')

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
          </div>
          <div className="article-body">
            <p>{knowledge.content}</p>
            <KnowledgeQuestionForm id={id} />
          </div>
        </>
      )}
    </Modal>
  )
}

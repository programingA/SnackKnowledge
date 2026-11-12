import { useId, useState } from 'react'
import { generateKnowledgeQuiz, submitKnowledgeQuiz } from '../../api/knowledge'

export default function KnowledgeQuiz({ id, onComplete }) {
  const questionId = useId()
  const [quiz, setQuiz] = useState(null)
  const [selectedIndex, setSelectedIndex] = useState(null)
  const [grade, setGrade] = useState(null)
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const busy = loading || submitting

  async function handleGenerate() {
    if (busy) return

    setLoading(true)
    setError('')
    try {
      setQuiz(await generateKnowledgeQuiz(id))
      setSelectedIndex(null)
      setGrade(null)
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit() {
    if (busy || !quiz || selectedIndex === null || grade) return

    setSubmitting(true)
    setError('')
    try {
      const result = await submitKnowledgeQuiz(quiz.quizId, selectedIndex)
      setGrade(result)
      onComplete?.('quiz')
    } catch (error) {
      setError(error.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section>
      <h3>퀴즈로 복습하기</h3>
      <button
        type="button"
        className="primary-button"
        onClick={handleGenerate}
        disabled={busy}
      >
        {loading ? '문제를 만드는 중...' : quiz ? '새 퀴즈 만들기' : '퀴즈 만들기'}
      </button>

      {error && <p role="alert">{error}</p>}

      {quiz && (
        <>
          <div className="quiz-question">
            <h4 id={questionId}>{quiz.question}</h4>
          </div>
          <fieldset
            className="quiz-options"
            aria-labelledby={questionId}
            disabled={busy || grade !== null}
          >
            {quiz.options.map((option, index) => (
              <label className="option" key={index}>
                <input
                  type="radio"
                  name={questionId}
                  checked={selectedIndex === index}
                  onChange={() => setSelectedIndex(index)}
                />
                {option}
              </label>
            ))}
          </fieldset>

          {grade ? (
            <div className="response" role="status">
              <strong>{grade.correct ? '정답이에요!' : '오답이에요.'}</strong>
              <p>정답: {quiz.options[grade.correctIndex]}</p>
              <p>{grade.explanation}</p>
            </div>
          ) : (
            <button
              type="button"
              className="primary-button"
              disabled={busy || selectedIndex === null}
              onClick={handleSubmit}
            >
              {submitting ? '채점 중...' : '정답 확인하기'}
            </button>
          )}
        </>
      )}
    </section>
  )
}

import { useId, useState } from 'react'
import { generateKnowledgeQuiz, submitKnowledgeQuiz } from '../../api/knowledge'
import { startWrongAnswerQuiz } from '../../api/wrongAnswers'
import GenerationProgress, { LoadingSpinner } from '../ui/GenerationProgress'
import Icon from '../ui/Icon'

export default function KnowledgeQuiz({ studyPath, practiceId, initialQuiz = null, onComplete }) {
  const questionId = useId()
  const [quiz, setQuiz] = useState(initialQuiz)
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
      setQuiz(await (practiceId ? startWrongAnswerQuiz(practiceId) : generateKnowledgeQuiz(studyPath)))
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

  const generateLabel = loading ? '문제를 불러오는 중...'
    : practiceId ? '처음부터 다시 풀기'
      : quiz ? '새 퀴즈 만들기' : '퀴즈 만들기'

  return (
    <section className="knowledge-quiz-panel" aria-labelledby={questionId + '-title'}>
      <div className="knowledge-quiz-header">
        <h3 id={questionId + '-title'}>퀴즈로 복습하기</h3>
        {quiz && (
          <button type="button" className="text-button quiz-regenerate-button" onClick={handleGenerate} disabled={busy}>
            {loading ? <LoadingSpinner /> : <Icon name="refresh" size={16} />}
            {generateLabel}
          </button>
        )}
      </div>
      {error && <p role="alert">{error}</p>}
      {loading && (
        <GenerationProgress>{practiceId ? '저장한 문제를 불러오고 있어요.' : '퀴즈 문제와 보기를 만들고 있어요.'}</GenerationProgress>
      )}

      {!quiz ? (
        <div className="knowledge-quiz-start">
          <button type="button" className="primary-button" onClick={handleGenerate} disabled={busy}>
            {loading && <LoadingSpinner />}
            {generateLabel}
          </button>
        </div>
      ) : (
        <>
          <div className="quiz-question">
            <h4 id={questionId}>{quiz.question}</h4>
          </div>
          <fieldset className="quiz-options" aria-labelledby={questionId} disabled={busy || grade !== null}>
            {quiz.options.map((option, index) => (
              <label className="option" key={index}>
                <input type="radio" name={questionId} checked={selectedIndex === index}
                  onChange={() => setSelectedIndex(index)} />
                {option}
              </label>
            ))}
          </fieldset>

          {grade && (
            <div className="response" role="status">
              <strong>{grade.correct ? '정답이에요!' : '오답이에요.'}</strong>
              <p>정답: {quiz.options[grade.correctIndex]}</p>
              <p>{grade.explanation}</p>
            </div>
          )}
          {!grade && (
            <div className="knowledge-quiz-footer">
              <button type="button" className="primary-button quiz-submit-button"
                disabled={busy || selectedIndex === null} onClick={handleSubmit}>
                {submitting ? '채점 중...' : '정답 확인하기'}
              </button>
            </div>
          )}
        </>
      )}
    </section>
  )
}

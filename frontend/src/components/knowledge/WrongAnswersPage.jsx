import { useEffect, useState } from 'react'
import { deleteWrongAnswer, getWrongAnswers, startWrongAnswerQuiz } from '../../api/wrongAnswers'
import KnowledgeQuiz from './KnowledgeQuiz'
import './WrongAnswers.css'

const dateFormat = new Intl.DateTimeFormat('ko-KR', { dateStyle: 'medium' })

export default function WrongAnswersPage({ username, onSignIn }) {
  return (
    <main className="page-shell wrong-answers-page" id="wrong-answers-page" tabIndex={-1}>
      <a className="wrong-answers-back" href="#knowledge-feed">← 지식 목록으로</a>
      <h1>오답 노트</h1>
      {username ? <WrongAnswerList key={username} /> : (
        <div className="wrong-answer-panel">
          <p>로그인하면 틀린 퀴즈를 다시 풀 수 있어요.</p>
          <button className="primary-button" type="button" onClick={onSignIn}>로그인</button>
        </div>
      )}
    </main>
  )
}

function WrongAnswerList() {
  const [notes, setNotes] = useState(null)
  const [error, setError] = useState('')
  const [reload, setReload] = useState(0)
  const [pendingId, setPendingId] = useState(null)
  const [confirmId, setConfirmId] = useState(null)
  const [practice, setPractice] = useState(null)

  useEffect(() => {
    const controller = new AbortController()
    getWrongAnswers(controller.signal)
      .then(setNotes)
      .catch((error) => {
        if (!controller.signal.aborted) setError(error.message)
      })
    return () => controller.abort()
  }, [reload])

  async function retry(id) {
    setError('')
    setConfirmId(null)
    setPendingId(id)
    try {
      setPractice({ id, quiz: await startWrongAnswerQuiz(id) })
    } catch (error) {
      setError(error.message)
    } finally {
      setPendingId(null)
    }
  }

  async function remove(id) {
    setError('')
    setPendingId(id)
    try {
      await deleteWrongAnswer(id)
      setNotes((current) => current.filter((note) => note.id !== id))
      if (practice?.id === id) setPractice(null)
      setConfirmId(null)
    } catch (error) {
      setError(error.message)
    } finally {
      setPendingId(null)
    }
  }

  return (
    <>
      {error && <p className="wrong-answer-error" role="alert">{error}</p>}
      {notes === null && (error ? (
        <button className="primary-button" type="button" onClick={() => {
          setError('')
          setReload((current) => current + 1)
        }}>다시 불러오기</button>
      ) : <p role="status">오답을 불러오는 중이에요.</p>)}
      {notes?.length === 0 && <p className="wrong-answer-panel">아직 기록된 오답이 없어요.</p>}
      {notes?.length > 0 && (
        <ul className="wrong-answer-list">
          {notes.map((note) => (
            <li className="wrong-answer-panel" key={note.id}>
              <p className="wrong-answer-title">{note.knowledgeTitle}</p>
              <h2>{note.question}</h2>
              <time dateTime={note.savedAt}>{dateFormat.format(new Date(note.savedAt))}</time>
              <div className="wrong-answer-actions">
                {confirmId === note.id ? (
                  <>
                    <p>이 오답을 삭제할까요?</p>
                    <button type="button" className="wrong-answer-delete" disabled={pendingId !== null}
                      onClick={() => remove(note.id)}>삭제 확인</button>
                    <button type="button" className="text-button" disabled={pendingId !== null}
                      onClick={() => setConfirmId(null)}>취소</button>
                  </>
                ) : (
                  <>
                    <button type="button" className="primary-button" disabled={pendingId !== null}
                      onClick={() => retry(note.id)}>
                      {pendingId === note.id ? '불러오는 중...' : '다시 풀기'}
                    </button>
                    <button type="button" className="wrong-answer-delete" disabled={pendingId !== null}
                      onClick={() => setConfirmId(note.id)}>삭제</button>
                  </>
                )}
              </div>
              {practice?.id === note.id && (
                <div className="wrong-answer-practice">
                  <KnowledgeQuiz key={practice.quiz.quizId} practiceId={note.id} initialQuiz={practice.quiz} />
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </>
  )
}

import { useEffect, useState } from 'react'
import { deleteWrongAnswer, getWrongAnswers, startWrongAnswerQuiz } from '../../api/wrongAnswers'
import DeleteConfirmationModal from '../ui/DeleteConfirmationModal'
import LoadError from '../ui/LoadError'
import LoadingSkeleton from '../ui/LoadingSkeleton'
import KnowledgeQuiz from './KnowledgeQuiz'
import './WrongAnswers.css'

const dateFormat = new Intl.DateTimeFormat('ko-KR', { dateStyle: 'medium' })

export default function WrongAnswersPage({ username, onSignIn }) {
  return (
    <main className="page-shell wrong-answers-page" id="wrong-answers-page" tabIndex={-1}>
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
  const [loadError, setLoadError] = useState(false)
  const [error, setError] = useState('')
  const [reload, setReload] = useState(0)
  const [pendingId, setPendingId] = useState(null)
  const [confirmNote, setConfirmNote] = useState(null)
  const [practice, setPractice] = useState(null)

  useEffect(() => {
    const controller = new AbortController()
    getWrongAnswers(controller.signal)
      .then((result) => {
        if (!controller.signal.aborted) setNotes(result)
      })
      .catch(() => {
        if (!controller.signal.aborted) setLoadError(true)
      })
    return () => controller.abort()
  }, [reload])

  async function retry(id) {
    setError('')
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
    await deleteWrongAnswer(id)
    setError('')
    setNotes((current) => current.filter((note) => note.id !== id))
    if (practice?.id === id) setPractice(null)
    setConfirmNote(null)
  }

  if (loadError) {
    return <LoadError message="오답 노트를 불러오지 못했어요." onRetry={() => {
      setLoadError(false)
      setReload((current) => current + 1)
    }} />
  }

  return (
    <>
      {error && <p className="wrong-answer-error" role="alert">{error}</p>}
      {notes === null && <LoadingSkeleton layout="rows" label="오답을 불러오는 중이에요." />}
      {notes?.length === 0 && <p className="wrong-answer-panel">아직 기록된 오답이 없어요.</p>}
      {notes?.length > 0 && (
        <ul className="wrong-answer-list">
          {notes.map((note) => (
            <li className="wrong-answer-panel" key={note.id}>
              <p className="wrong-answer-title">
                {note.knowledgeId ? <a href={`#/knowledge/${note.knowledgeId}`}>{note.knowledgeTitle}</a> : note.knowledgeTitle}
              </p>
              <h2>{note.question}</h2>
              <time dateTime={note.savedAt}>{dateFormat.format(new Date(note.savedAt))}</time>
              <div className="wrong-answer-actions">
                <button type="button" className="primary-button wrong-answer-retry" disabled={pendingId !== null}
                  onClick={() => retry(note.id)}>
                  {pendingId === note.id ? '불러오는 중...' : '다시 풀기'}
                </button>
                <button type="button" className="delete-button" disabled={pendingId !== null}
                  onClick={() => setConfirmNote(note)}>삭제</button>
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
      {confirmNote && (
        <DeleteConfirmationModal label="오답 삭제" question="이 오답을 삭제할까요?" itemName={confirmNote.question}
          onClose={() => setConfirmNote(null)} onConfirm={() => remove(confirmNote.id)} />
      )}
    </>
  )
}

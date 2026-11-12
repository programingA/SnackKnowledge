import { useEffect, useState } from 'react'
import { deleteGeneratedCard, getGeneratedCard, getGeneratedCards } from '../../api/generatedCards'
import GeneratedCardBody from './GeneratedCardBody'
import CommunityShareControls from './CommunityShareControls'
import './GeneratedCards.css'

export default function SavedGeneratedCardsPage({ username, id, onSignIn }) {
  return (
    <main className="page-shell generated-cards-page" id="generated-cards-page" tabIndex={-1}>
      <a className="generated-cards-back" href={id ? '#/generated-cards' : '#knowledge-feed'}>
        {id ? '← 생성한 카드로' : '← 지식 목록으로'}
      </a>
      <h1>생성한 카드</h1>
      {username ? <SavedCards key={username + ':' + (id ?? 'list')} id={id} /> : (
        <div className="generated-cards-panel">
          <p>로그인하면 저장한 카드를 볼 수 있어요.</p>
          <button className="primary-button" type="button" onClick={onSignIn}>로그인</button>
        </div>
      )}
    </main>
  )
}

function SavedCards({ id }) {
  const [data, setData] = useState(null)
  const [loadError, setLoadError] = useState('')
  const [attempt, setAttempt] = useState(0)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState('')

  useEffect(() => {
    const controller = new AbortController()
    const request = id ? getGeneratedCard(id, controller.signal) : getGeneratedCards(controller.signal)
    request.then(setData).catch((error) => {
      if (!controller.signal.aborted) setLoadError(error.message)
    })
    return () => controller.abort()
  }, [id, attempt])

  async function handleDelete() {
    setDeleting(true)
    setDeleteError('')
    try {
      await deleteGeneratedCard(id)
      window.location.hash = '/generated-cards'
    } catch (error) {
      setDeleteError(error.message)
      setDeleting(false)
    }
  }

  if (loadError) {
    return (
      <div className="generated-cards-panel">
        <p role="alert">{loadError}</p>
        <button className="primary-button" type="button" onClick={() => {
          setLoadError('')
          setAttempt((current) => current + 1)
        }}>다시 불러오기</button>
      </div>
    )
  }
  if (data === null) return <p className="generated-cards-panel" role="status">카드를 불러오는 중이에요.</p>
  if (id) {
    return (
      <article className="generated-cards-panel saved-generated-card">
        <p className="category-label">{data.category}</p>
        <h2>{data.title}</h2>
        <GeneratedCardBody card={data} />
        <CommunityShareControls id={id} />
        <div className="generated-card-actions">
          {confirmDelete ? (
            <>
              <p>이 카드를 삭제할까요?</p>
              <button className="generated-delete" type="button" disabled={deleting} onClick={handleDelete}>
                {deleting ? '삭제 중...' : '삭제 확인'}
              </button>
              <button className="text-button" type="button" disabled={deleting} onClick={() => {
                setConfirmDelete(false)
                setDeleteError('')
              }}>취소</button>
            </>
          ) : <button className="generated-delete" type="button" onClick={() => setConfirmDelete(true)}>카드 삭제</button>}
          {deleteError && <p className="generated-card-error" role="alert">{deleteError}</p>}
        </div>
      </article>
    )
  }
  if (!data.length) return <p className="generated-cards-panel">아직 저장한 카드가 없어요.</p>

  return (
    <ul className="saved-generated-list">
      {data.map((card) => (
        <li key={card.id} className="generated-cards-panel">
          <p className="category-label">{card.category}</p>
          <h2><a href={`#/generated-cards/${card.id}`}>{card.title}</a></h2>
          <p>{card.summary}</p>
        </li>
      ))}
    </ul>
  )
}

import { useState } from 'react'
import { deleteGeneratedCard, getGeneratedCard, getGeneratedCards } from '../../api/generatedCards'
import useApiQuery from '../../api/useApiQuery'
import LoadError from '../ui/LoadError'
import GeneratedArticle from './GeneratedArticle'
import CommunityShareControls from './CommunityShareControls'
import KnowledgeCard from './KnowledgeCard'
import useArticleBackLinkRef from './useArticleBackLinkRef'
import './GeneratedCards.css'

export default function SavedGeneratedCardsPage({ username, id, onSignIn }) {
  const backLinkRef = useArticleBackLinkRef()
  const backLink = id && <a className="article-back" href="#/generated-cards" ref={backLinkRef}>← 생성한 카드로</a>

  return (
    <main className={id ? "page-shell article-page" : "page-shell generated-cards-page"} id="generated-cards-page" tabIndex={-1}>
      {(!id || !username) && <h1>생성한 카드</h1>}
      {username ? <SavedCards key={username + ':' + (id ?? 'list')} id={id} backLink={backLink} /> : (
        <>
          {backLink}
          <div className="generated-cards-panel">
            <p>로그인하면 저장한 카드를 볼 수 있어요.</p>
            <button className="primary-button" type="button" onClick={onSignIn}>로그인</button>
          </div>
        </>
      )}
    </main>
  )
}

function loadGeneratedCards(signal, id) {
  return id ? getGeneratedCard(id, signal) : getGeneratedCards(signal)
}

function SavedCards({ id, backLink }) {
  const { data, error: loadError, retry } = useApiQuery(loadGeneratedCards, id)
  const errorMessage = id ? '저장한 카드를 불러오지 못했어요.' : '저장한 카드 목록을 불러오지 못했어요.'
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState('')

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

  if (loadError || data === null) {
    return (
      <>
        {backLink}
        {loadError ? (
          <LoadError heading={id ? 'h1' : 'h2'} message={id && loadError.status === 404 ? loadError.message : errorMessage}
            onRetry={retry} />
        ) : <p className="generated-cards-panel" role="status">카드를 불러오는 중이에요.</p>}
      </>
    )
  }
  if (id) {
    return (
      <GeneratedArticle card={data} studyPath={`/api/study/generated/saved/${id}`}
        headerActions={(
          <>
            {backLink}
            <CommunityShareControls id={id} />
          </>
        )}>
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
      </GeneratedArticle>
    )
  }
  if (!data.length) return <p className="generated-cards-panel">아직 저장한 카드가 없어요.</p>

  return (
    <ul className="knowledge-card-list" role="list">
      {data.map((card) => (
        <li key={card.id}>
          <KnowledgeCard card={card} href={`#/generated-cards/${card.id}`} heading="h2" />
        </li>
      ))}
    </ul>
  )
}

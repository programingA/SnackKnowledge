import { useEffect, useRef, useState } from 'react'
import { deleteGeneratedCard, getGeneratedCard, getGeneratedCards } from '../../api/generatedCards'
import useApiQuery from '../../api/useApiQuery'
import LoadError from '../ui/LoadError'
import LoadingSkeleton from '../ui/LoadingSkeleton'
import Modal from '../ui/Modal'
import GeneratedArticle from './GeneratedArticle'
import CommunityShareControls from './CommunityShareControls'
import KnowledgeCard from './KnowledgeCard'
import useArticleBackLinkRef from './useArticleBackLinkRef'
import './GeneratedCards.css'

export default function SavedGeneratedCardsPage({ username, id, onSignIn }) {
  const titleRef = useRef(null)
  const backLinkRef = useArticleBackLinkRef()
  const backLink = id && <a className="article-back" href="#/generated-cards" ref={backLinkRef}>← 생성한 카드로</a>

  return (
    <main className={id ? "page-shell article-page" : "page-shell generated-cards-page"} id="generated-cards-page" tabIndex={-1}>
      {(!id || !username) && <h1 ref={titleRef} tabIndex={-1}>생성한 카드</h1>}
      {username ? <SavedCards key={username + ':' + (id ?? 'list')} id={id} titleRef={titleRef} backLink={backLink} /> : (
        <div className="generated-cards-panel">
          {backLink && <div>{backLink}</div>}
          <p>로그인하면 저장한 카드를 볼 수 있어요.</p>
          <button className="primary-button" type="button" onClick={onSignIn}>로그인</button>
        </div>
      )}
    </main>
  )
}

function loadGeneratedCards(signal, id) {
  return id ? getGeneratedCard(id, signal) : getGeneratedCards(signal)
}

function SavedCards({ id, titleRef, backLink }) {
  const { data, error: loadError, retry } = useApiQuery(loadGeneratedCards, id)
  const errorMessage = id ? '저장한 카드를 불러오지 못했어요.' : '저장한 카드 목록을 불러오지 못했어요.'
  if (loadError || data === null) {
    const status = loadError ? (
      <LoadError heading={id ? 'h1' : 'h2'}
        message={id && loadError.status === 404 ? loadError.message : errorMessage} onRetry={retry} />
    ) : <LoadingSkeleton layout={id ? 'article' : 'rows'} label="저장한 카드를 불러오는 중이에요." />

    return id ? (
      <div className="article-page-card saved-card-status">
        <div className="saved-card-back">{backLink}</div>
        {status}
      </div>
    ) : status
  }

  if (id) {
    return <GeneratedArticle card={data} studyPath={`/api/study/generated/saved/${id}`}
      backLink={backLink} headerActions={<CommunityShareControls id={id} />} />
  }

  return <SavedCardList cards={data} titleRef={titleRef} />
}

function SavedCardList({ cards, titleRef }) {
  const [selected, setSelected] = useState(null)
  const [deletedIds, setDeletedIds] = useState(new Set())
  const visibleCards = cards.filter((card) => !deletedIds.has(card.id))

  useEffect(() => {
    if (deletedIds.size) titleRef.current?.focus({ preventScroll: true })
  }, [deletedIds, titleRef])

  if (!visibleCards.length) return <p className="generated-cards-panel">아직 저장한 카드가 없어요.</p>

  return (
    <>
      <ul className="knowledge-card-list" role="list">
        {visibleCards.map((card) => (
          <li key={card.id}>
            <KnowledgeCard card={card} href={`#/generated-cards/${card.id}`} heading="h2" actions={(
              <button className="generated-delete generated-list-delete" type="button"
                aria-label={`${card.title} 카드 삭제`} onClick={() => setSelected(card)}>삭제</button>
            )} />
          </li>
        ))}
      </ul>
      {selected && <DeleteCardModal card={selected} onClose={() => setSelected(null)} onDeleted={() => {
        setDeletedIds((current) => new Set([...current, selected.id]))
        setSelected(null)
      }} />}
    </>
  )
}

function DeleteCardModal({ card, onClose, onDeleted }) {
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState('')

  async function confirmDelete() {
    setDeleting(true)
    setError('')
    try {
      await deleteGeneratedCard(card.id)
      onDeleted()
    } catch {
      setError('카드를 삭제하지 못했어요. 다시 시도해 주세요.')
      setDeleting(false)
    }
  }

  return (
    <Modal label="카드 삭제" className="generated-delete-modal" onClose={onClose} dismissible={!deleting}>
      <h2>이 카드를 삭제할까요?</h2>
      <p className="generated-delete-title">{card.title}</p>
      <p>공개 중이거나 검토를 요청한 카드도 함께 내려가요.</p>
      {error && <p className="generated-card-error" role="alert">{error}</p>}
      <div className="generated-delete-actions">
        <button className="text-button" type="button" onClick={onClose} disabled={deleting}>취소</button>
        <button className="generated-delete" type="button" onClick={confirmDelete} disabled={deleting}>
          {deleting ? '삭제 중...' : '카드 삭제'}
        </button>
      </div>
    </Modal>
  )
}

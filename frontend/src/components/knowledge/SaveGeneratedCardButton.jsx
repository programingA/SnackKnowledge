import { useCallback, useEffect, useRef, useState } from 'react'
import Icon from '../ui/Icon'
import StatusToast from '../ui/StatusToast'
import { deleteGeneratedCard, saveGeneratedCard } from '../../api/generatedCards'
import './GeneratedCards.css'

export default function SaveGeneratedCardButton({ card, studyId, username, onSignIn, onSavedCardsChange }) {
  const cardId = useRef(null)
  const signInRequested = useRef(false)
  const saveButton = useRef(null)
  const [pending, setPending] = useState(false)
  const [saved, setSaved] = useState(null)
  const [showSavedNotice, setShowSavedNotice] = useState(false)
  const dismissNotice = useCallback(() => setShowSavedNotice(false), [])
  const [error, setError] = useState('')
  const savedId = saved && saved.username === username ? saved.id : null

  useEffect(() => {
    if (username && signInRequested.current) {
      signInRequested.current = false
      saveButton.current?.focus({ preventScroll: true })
    }
  }, [username])

  async function toggleSave() {
    if (pending) return

    setPending(true)
    setError('')
    try {
      if (savedId) {
        await deleteGeneratedCard(savedId)
        setSaved(null)
        setShowSavedNotice(false)
      } else {
        const payload = { category: card.category, title: card.title, summary: card.summary,
          content: card.content, imageBase64: card.imageBase64 }
        cardId.current ??= studyId ?? crypto.randomUUID()
        await saveGeneratedCard(cardId.current, payload)
        setSaved({ id: cardId.current, username })
        setShowSavedNotice(true)
      }
      onSavedCardsChange()
    } catch (error) {
      setError(error.message)
    } finally {
      setPending(false)
    }
  }

  if (!username) return (
    <button className="primary-button" type="button" aria-haspopup="dialog" onClick={() => {
      signInRequested.current = true
      onSignIn()
    }}>
      <Icon name="bookmark" size={17} />
      로그인하고 저장
    </button>
  )

  const label = savedId ? (pending ? '저장 취소 중...' : '저장 취소') : (pending ? '저장 중...' : '내 카드에 저장')
  const showNotice = showSavedNotice && savedId

  return (
    <div className="generated-card-actions">
      <button className="primary-button" type="button" ref={saveButton} onClick={toggleSave} disabled={pending}>
        {label}
      </button>
      <StatusToast message={showNotice ? '저장된 지식' : ''} onDismiss={dismissNotice} />
      {error && <p className="generated-card-error" role="alert">{error}</p>}
    </div>
  )
}

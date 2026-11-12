import { useEffect, useRef, useState } from 'react'
import Icon from '../ui/Icon'
import { saveGeneratedCard } from '../../api/generatedCards'
import './GeneratedCards.css'

export default function SaveGeneratedCardButton({ card, studyId, username, onSignIn }) {
  const cardId = useRef(null)
  const signInRequested = useRef(false)
  const saveButton = useRef(null)
  const [saving, setSaving] = useState(false)
  const [savedId, setSavedId] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    if (username && signInRequested.current) {
      signInRequested.current = false
      saveButton.current?.focus({ preventScroll: true })
    }
  }, [username])

  async function handleSave() {
    setSaving(true)
    setError('')
    try {
      const payload = { category: card.category, title: card.title, summary: card.summary,
        content: card.content, imageBase64: card.imageBase64 }
      cardId.current ??= studyId ?? crypto.randomUUID()
      await saveGeneratedCard(cardId.current, payload)
      setSavedId(cardId.current)
    } catch (error) {
      setError(error.message)
    } finally {
      setSaving(false)
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

  return (
    <div className="generated-card-actions">
      {savedId ? (
        <>
          <p role="status">내 카드에 저장했어요.</p>
          <a className="text-button" href={`#/generated-cards/${savedId}`}>저장한 카드 보기</a>
        </>
      ) : (
        <button className="primary-button" type="button" ref={saveButton} onClick={handleSave} disabled={saving}>
          {saving ? '저장 중...' : '내 카드에 저장'}
        </button>
      )}
      {error && <p className="generated-card-error" role="alert">{error}</p>}
    </div>
  )
}

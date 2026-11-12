import { useRef, useState } from 'react'
import { saveGeneratedCard } from '../../api/generatedCards'
import './GeneratedCards.css'

export default function SaveGeneratedCardButton({ card, username, onClose }) {
  const cardId = useRef(null)
  const [saving, setSaving] = useState(false)
  const [savedId, setSavedId] = useState(null)
  const [error, setError] = useState('')

  async function handleSave() {
    setSaving(true)
    setError('')
    try {
      cardId.current ??= crypto.randomUUID()
      await saveGeneratedCard(cardId.current, card)
      setSavedId(cardId.current)
    } catch (error) {
      setError(error.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="generated-card-actions">
      {username ? (
        savedId ? (
          <>
            <p role="status">내 카드에 저장했어요.</p>
            <a className="text-button" href={`#/generated-cards/${savedId}`} onClick={onClose}>저장한 카드 보기</a>
          </>
        ) : (
          <button className="primary-button" type="button" onClick={handleSave} disabled={saving}>
            {saving ? '저장 중...' : '내 카드에 저장'}
          </button>
        )
      ) : <p>로그인하면 생성한 카드를 보관할 수 있어요.</p>}
      {error && <p className="generated-card-error" role="alert">{error}</p>}
    </div>
  )
}

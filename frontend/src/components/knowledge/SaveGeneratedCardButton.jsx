import { useEffect, useRef, useState } from 'react'
import Icon from '../ui/Icon'
import { saveGeneratedCard } from '../../api/generatedCards'
import './GeneratedCards.css'

export default function SaveGeneratedCardButton({ card, username, onSignIn }) {
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
      const { studyId, ...payload } = card
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
    <div className="takeaway generated-sign-in-note">
      <Icon name="bookmark" />
      <div>
        <strong>생성한 지식 저장하기</strong>
        <p>로그인하면 이 카드를 보관함에 저장해 다시 볼 수 있어요. AI 질문·퀴즈·직접 설명하기는 지금도 이용할 수 있어요.</p>
        <button className="text-button generated-sign-in-link" type="button" aria-haspopup="dialog" onClick={() => {
          signInRequested.current = true
          onSignIn()
        }}>
          로그인하러 가기 <Icon name="arrow" size={16} />
        </button>
      </div>
    </div>
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

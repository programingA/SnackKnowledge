import { useEffect, useState } from 'react'
import { getInterests, saveInterests } from '../../api/interests'
import './InterestSettings.css'

export default function InterestSettingsPage({ username, onSignIn }) {
  return (
    <main className="page-shell interests-page" id="interests-page" tabIndex={-1}>
      <h1>관심 분야 설정</h1>
      <p className="interests-description">선택한 분야를 홈 추천에 반영해요.</p>
      {username ? <InterestForm key={username} /> : (
        <div className="interests-panel">
          <p>로그인하면 관심 분야를 저장할 수 있어요.</p>
          <button className="primary-button" type="button" onClick={onSignIn}>로그인</button>
        </div>
      )}
    </main>
  )
}

function InterestForm() {
  const [settings, setSettings] = useState(null)
  const [chosen, setChosen] = useState(new Set())
  const [saving, setSaving] = useState(false)
  const [loadError, setLoadError] = useState('')
  const [saveError, setSaveError] = useState('')
  const [notice, setNotice] = useState('')
  const [revision, setRevision] = useState(0)

  useEffect(() => {
    const controller = new AbortController()
    getInterests(controller.signal).then((result) => {
      setSettings(result)
      setChosen(new Set(result.selected))
    }).catch((error) => {
      if (!controller.signal.aborted) setLoadError(error.message)
    })
    return () => controller.abort()
  }, [revision])

  function toggle(category) {
    setChosen((current) => {
      const next = new Set(current)
      if (next.has(category)) next.delete(category)
      else next.add(category)
      return next
    })
    setNotice('')
  }

  const changed = settings !== null && (
    chosen.size !== settings.selected.length || !settings.selected.every((item) => chosen.has(item))
  )

  async function handleSave(event) {
    event.preventDefault()
    if (saving || !changed) return

    const selected = settings.categories.filter((category) => chosen.has(category))
    setSaveError('')
    setNotice('')
    setSaving(true)
    try {
      await saveInterests(selected)
      setSettings({ ...settings, selected })
      setNotice('관심 분야를 저장했어요.')
    } catch (error) {
      setSaveError(error.message)
    } finally {
      setSaving(false)
    }
  }

  function reload() {
    setSettings(null)
    setLoadError('')
    setSaveError('')
    setNotice('')
    setRevision((current) => current + 1)
  }

  if (loadError) {
    return (
      <div className="interests-panel">
        <p role="alert">{loadError}</p>
        <button className="primary-button" type="button" onClick={reload}>다시 불러오기</button>
      </div>
    )
  }
  if (!settings) return <p className="interests-panel" role="status">분야를 불러오는 중이에요.</p>
  if (!settings.categories.length) return <p className="interests-panel">아직 선택할 수 있는 분야가 없어요.</p>

  return (
    <form className="interests-panel interest-form" onSubmit={handleSave}>
      <fieldset disabled={saving}>
        <legend>관심 분야</legend>
        <div className="interest-options">
          {settings.categories.map((category) => (
            <label className="interest-option" key={category}>
              <input type="checkbox" checked={chosen.has(category)} onChange={() => toggle(category)} />
              <span>{category}</span>
            </label>
          ))}
        </div>
      </fieldset>
      <div className="interest-actions">
        <button className="primary-button" type="submit" disabled={saving || !changed}>
          {saving ? '저장 중...' : '관심 분야 저장'}
        </button>
        <span>{chosen.size}개 선택</span>
      </div>
      {notice && <p className="interest-message" role="status">{notice}</p>}
      {saveError && (
        <div className="interest-message">
          <p role="alert">{saveError}</p>
          <button type="button" className="text-button" onClick={reload}>목록 다시 불러오기</button>
        </div>
      )}
    </form>
  )
}

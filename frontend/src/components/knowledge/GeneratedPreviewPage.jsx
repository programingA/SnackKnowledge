import { useEffect, useState } from 'react'
import { reconnectGeneratedPreview } from '../../api/study'
import Icon from '../ui/Icon'
import GeneratedArticle from './GeneratedArticle'
import SaveGeneratedCardButton from './SaveGeneratedCardButton'

export default function GeneratedPreviewPage({ card, restored, storageWarning, loading, username, visible, onSignIn, onGenerate }) {
  const [reconnectedId, setReconnectedId] = useState(null)
  const [studyError, setStudyError] = useState('')
  const [attempt, setAttempt] = useState(0)
  const studyId = reconnectedId ?? (restored ? null : card?.studyId)

  useEffect(() => {
    if (!visible || !card || studyId) return
    const controller = new AbortController()
    reconnectGeneratedPreview(card, controller.signal).then((id) => {
      if (!controller.signal.aborted) setReconnectedId(id)
    }).catch((error) => {
      if (!controller.signal.aborted) setStudyError(error.message)
    })
    return () => controller.abort()
  }, [visible, card, studyId, attempt])

  return (
    <main className="page-shell article-page" id="generated-preview-page" tabIndex={-1} hidden={!visible}>
      {card && (
        <div className="generated-preview-nav">
          <button className="primary-button generated-preview-secondary" type="button" onClick={onGenerate}>
            <Icon name="sparkle" size={16} />
            다른 지식 만들기
          </button>
        </div>
      )}
      {storageWarning && <p className="generated-study-status" role="status">{storageWarning}</p>}
      {card && !studyId && (studyError ? (
        <div className="generated-study-status">
          <p role="alert">{studyError}</p>
          <button className="text-button" type="button" onClick={() => {
            setStudyError('')
            setAttempt((current) => current + 1)
          }}>학습 기능 다시 연결하기</button>
        </div>
      ) : <p className="generated-study-status" role="status">학습 기능을 연결하는 중이에요.</p>)}
      {card ? (
        <GeneratedArticle card={card} showStudy studyPath={studyId ? `/api/study/generated/preview/${studyId}` : undefined}
          showImageFallback={Object.hasOwn(card, 'imageBase64')}
          headerActions={(
            <>
              <div className="generated-preview-save">
                <SaveGeneratedCardButton card={card} studyId={studyId} username={username} onSignIn={onSignIn} />
              </div>
              {!username && (
                <p className="generated-preview-hint">
                  <Icon name="info" size={14} />
                  로그인하면 이 카드를 보관함에 저장할 수 있어요.
                </p>
              )}
            </>
          )}
        />
      ) : loading ? (
        <p className="generated-cards-panel" role="status">생성한 카드를 불러오는 중이에요.</p>
      ) : (
        <div className="generated-cards-panel">
          <p>열어볼 생성 카드가 없어요.</p>
          <button className="primary-button" type="button" onClick={onGenerate}>지식 카드 만들기</button>
        </div>
      )}
    </main>
  )
}

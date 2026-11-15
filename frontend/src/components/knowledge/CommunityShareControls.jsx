import { useEffect, useState } from 'react'
import { getShareStatus, submitShare, withdrawShare } from '../../api/community'
import './Community.css'

const statusLabels = {
  PRIVATE: '내 보관함에만 있음',
  PENDING: '검토 중',
  APPROVED: '공개 중',
  REJECTED: '반려',
}

export default function CommunityShareControls({ id }) {
  const [status, setStatus] = useState(null)
  const [error, setError] = useState('')
  const [pending, setPending] = useState(false)
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    const controller = new AbortController()
    getShareStatus(id, controller.signal)
      .then((result) => setStatus(result.status))
      .catch((error) => {
        if (!controller.signal.aborted) setError(error.message)
      })
    return () => controller.abort()
  }, [id, attempt])

  async function changeShare() {
    setPending(true)
    setError('')
    try {
      if (status === 'PRIVATE') {
        setStatus((await submitShare(id)).status)
      } else {
        await withdrawShare(id)
        setStatus('PRIVATE')
      }
    } catch (error) {
      setError(error.message)
    } finally {
      setPending(false)
    }
  }

  return (
    <section className="community-share" aria-label="커뮤니티 공개 관리">
      <div className="community-share-row">
        <p className="community-share-status" role="status">
          공개 상태 <strong>{status ? statusLabels[status] : error ? '확인할 수 없음' : '확인 중'}</strong>
        </p>
        {status ? (
          <button type="button" className="text-button" disabled={pending} onClick={changeShare}>
            {pending ? '처리 중...' : status === 'PRIVATE' ? '공개 검토 요청'
              : status === 'APPROVED' ? '공개 취소' : '검토 요청 철회'}
          </button>
        ) : error && (
          <button type="button" className="text-button" onClick={() => {
            setError('')
            setAttempt((current) => current + 1)
          }}>공유 상태 다시 확인</button>
        )}
      </div>
      {status === 'PRIVATE' && <p>검토를 통과하면 카드가 커뮤니티에 공개돼요.</p>}
      {error && <p className="generated-card-error" role="alert">{error}</p>}
    </section>
  )
}

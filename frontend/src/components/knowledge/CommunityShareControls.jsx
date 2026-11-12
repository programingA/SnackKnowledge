import { useEffect, useState } from 'react'
import { getShareStatus, submitShare, withdrawShare } from '../../api/community'

const statusLabels = {
  PRIVATE: '내 보관함에만 있어요. 검토를 통과하면 커뮤니티에 공개돼요.',
  PENDING: '공개 검토를 기다리는 중이에요.',
  APPROVED: '커뮤니티에 공개 중이에요.',
  REJECTED: '공개 검토에서 반려됐어요.',
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
    <section className="community-share" aria-label="커뮤니티 공유">
      {status && <p role="status">{statusLabels[status]}</p>}
      {status ? (
        <button type="button" className="text-button" disabled={pending} onClick={changeShare}>
          {pending ? '처리 중...' : status === 'PRIVATE' ? '공개 검토 요청'
            : status === 'APPROVED' ? '공개 취소' : '검토 요청 철회'}
        </button>
      ) : error ? (
        <button type="button" className="text-button" onClick={() => {
          setError('')
          setAttempt((current) => current + 1)
        }}>공유 상태 다시 확인</button>
      ) : <p role="status">공유 상태를 확인하는 중이에요.</p>}
      {error && <p className="generated-card-error" role="alert">{error}</p>}
    </section>
  )
}

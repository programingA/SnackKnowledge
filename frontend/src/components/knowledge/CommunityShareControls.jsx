import { useState } from 'react'
import { getShareStatus, submitShare, withdrawShare } from '../../api/community'
import useApiQuery from '../../api/useApiQuery'
import LoadError from '../ui/LoadError'
import './Community.css'

const statusLabels = {
  PRIVATE: '내 보관함에만 있음',
  PENDING: '검토 중',
  APPROVED: '공개 중',
  REJECTED: '반려',
}

function loadShareStatus(signal, id) {
  return getShareStatus(id, signal)
}

export default function CommunityShareControls({ id }) {
  const { data, error: loadError, retry } = useApiQuery(loadShareStatus, id)
  const [updatedStatus, setUpdatedStatus] = useState(null)
  const status = updatedStatus ?? data?.status
  const [error, setError] = useState('')
  const [pending, setPending] = useState(false)

  async function changeShare() {
    setPending(true)
    setError('')
    try {
      if (status === 'PRIVATE') {
        setUpdatedStatus((await submitShare(id)).status)
      } else {
        await withdrawShare(id)
        setUpdatedStatus('PRIVATE')
      }
    } catch (error) {
      setError(error.message)
    } finally {
      setPending(false)
    }
  }

  if (loadError) return <LoadError message="카드 공개 상태를 불러오지 못했어요." onRetry={retry} />

  return (
    <section className="community-share" aria-label="커뮤니티 공개 관리">
      <div className="community-share-row">
        <p className="community-share-status" role="status">
          공개 상태 <strong>{status ? statusLabels[status] : '확인 중'}</strong>
        </p>
        {status && (
          <button type="button" className="text-button" disabled={pending} onClick={changeShare}>
            {pending ? '처리 중...' : status === 'PRIVATE' ? '공개 검토 요청'
              : status === 'APPROVED' ? '공개 취소' : '검토 요청 철회'}
          </button>
        )}
      </div>
      {status === 'PRIVATE' && <p>검토를 통과하면 카드가 커뮤니티에 공개돼요.</p>}
      {error && <p className="generated-card-error" role="alert">{error}</p>}
    </section>
  )
}

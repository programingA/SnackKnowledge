import { useState } from 'react'
import Modal from './Modal'
import './DeleteConfirmationModal.css'

export default function DeleteConfirmationModal({ label, question, itemName, description, onClose, onConfirm }) {
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState('')

  async function confirmDelete() {
    if (deleting) return
    setDeleting(true)
    setError('')
    try {
      await onConfirm()
    } catch {
      setError('삭제하지 못했어요. 다시 시도해 주세요.')
      setDeleting(false)
    }
  }

  return (
    <Modal label={label} className="delete-confirmation-modal" onClose={onClose} dismissible={!deleting}>
      <h2>{question}</h2>
      <p className="delete-confirmation-item">{itemName}</p>
      {description && <p>{description}</p>}
      {error && <p className="delete-confirmation-error" role="alert">{error}</p>}
      <div className="delete-confirmation-actions">
        <button className="delete-button" type="button" onClick={confirmDelete} disabled={deleting}>
          {deleting ? '삭제 중...' : label}
        </button>
        <button className="text-button" type="button" onClick={onClose} disabled={deleting}>취소</button>
      </div>
    </Modal>
  )
}

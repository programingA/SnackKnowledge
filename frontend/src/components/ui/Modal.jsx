import { useEffect, useRef } from 'react'
import Icon from './Icon'

export default function Modal({ children, onClose, label, className = '' }) {
  const ref = useRef(null)
  useEffect(() => {
    const dialog = ref.current
    const previous = document.activeElement
    dialog.showModal()
    const overflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      dialog.close()
      document.body.style.overflow = overflow
      previous?.focus()
    }
  }, [])
  return (
    <dialog
      ref={ref}
      className={`modal ${className}`}
      aria-label={label}
      onCancel={onClose}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <button className="close-button" aria-label="창 닫기" onClick={onClose}>
        <Icon name="close" />
      </button>
      {children}
    </dialog>
  )
}

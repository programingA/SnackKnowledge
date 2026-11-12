import { useEffect, useRef } from 'react'
import Icon from './Icon'

export default function Modal({ children, onClose, label, className = '', dismissible = true }) {
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
      onCancel={(event) => {
        event.preventDefault()
        if (dismissible) onClose()
      }}
      onClick={(e) => {
        if (dismissible && e.target === e.currentTarget) onClose()
      }}
    >
      <button type="button" className="close-button" aria-label="창 닫기" onClick={onClose} disabled={!dismissible}>
        <Icon name="close" />
      </button>
      {children}
    </dialog>
  )
}

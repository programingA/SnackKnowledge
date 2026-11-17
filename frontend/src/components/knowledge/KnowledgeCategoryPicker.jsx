import { useEffect, useId, useRef, useState } from 'react'
import Icon from '../ui/Icon'

export default function KnowledgeCategoryPicker({ categories, value, onChange }) {
  const panelId = useId()
  const searchId = useId()
  const root = useRef(null)
  const button = useRef(null)
  const searchInput = useRef(null)
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const query = search.trim().toLowerCase()
  const options = categories.filter((category) => category.toLowerCase().includes(query))

  useEffect(() => {
    if (!open) return
    searchInput.current?.focus({ preventScroll: true })

    function closeOnOutsidePress(event) {
      if (!root.current?.contains(event.target)) setOpen(false)
    }

    document.addEventListener('pointerdown', closeOnOutsidePress)
    return () => document.removeEventListener('pointerdown', closeOnOutsidePress)
  }, [open])

  function closePicker() {
    setOpen(false)
    button.current?.focus({ preventScroll: true })
  }

  return (
    <div className="knowledge-category-picker" ref={root}
      onBlur={(event) => {
        if (event.relatedTarget && !event.currentTarget.contains(event.relatedTarget)) setOpen(false)
      }}
      onKeyDown={(event) => {
        if (open && event.key === 'Escape') {
          event.preventDefault()
          closePicker()
        }
      }}>
      <button type="button" className="knowledge-category-trigger" ref={button}
        aria-expanded={open} aria-controls={panelId}
        onClick={() => {
          if (open) {
            closePicker()
          } else {
            setSearch('')
            setOpen(true)
          }
        }}>
        <span title={value}>카테고리 · {value}</span>
        <span className="knowledge-category-chevron" aria-hidden="true" />
      </button>
      <div id={panelId} className="knowledge-category-panel" hidden={!open}>
        <label htmlFor={searchId}>카테고리 검색</label>
        <div className="knowledge-category-search">
          <Icon name="search" size={16} />
          <input id={searchId} type="search" placeholder="이름으로 찾기"
            ref={searchInput} value={search} onChange={(event) => setSearch(event.target.value)} />
        </div>
        <div className="knowledge-category-options" role="group" aria-label="카테고리 목록">
          {options.map((category) => (
            <button type="button" key={category} aria-pressed={value === category}
              onClick={() => {
                onChange(category)
                closePicker()
              }}>
              {category}
            </button>
          ))}
        </div>
        {!options.length && <p className="knowledge-category-empty" role="status">일치하는 카테고리가 없어요.</p>}
      </div>
    </div>
  )
}

import { useCallback, useRef } from 'react'

export default function useArticleBackLinkRef() {
  const link = useRef(null)
  const restoreFocus = useRef(false)

  return useCallback((node) => {
    // The link moves from the loading panel into the article header.
    if (!node) {
      restoreFocus.current = link.current === document.activeElement
    } else if (restoreFocus.current) {
      restoreFocus.current = false
      node.focus({ preventScroll: true })
    }
    link.current = node
  }, [])
}

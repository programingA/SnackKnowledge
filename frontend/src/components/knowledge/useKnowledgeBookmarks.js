import { useEffect, useRef, useState } from 'react'
import { getBookmarks, setBookmark } from '../../api/bookmarks'

const initial = { username: null, cards: null, error: '' }

export default function useKnowledgeBookmarks(username) {
  const [snapshot, setSnapshot] = useState(initial)
  const [attempt, setAttempt] = useState(0)
  const [pendingKeys, setPendingKeys] = useState(new Set())
  const inFlight = useRef(new Set())
  const { cards, error } = snapshot.username === username ? snapshot : initial

  useEffect(() => {
    if (!username) return
    const controller = new AbortController()
    getBookmarks(controller.signal)
      .then((cards) => {
        if (!controller.signal.aborted) setSnapshot({ username, cards, error: '' })
      })
      .catch((error) => {
        if (!controller.signal.aborted) setSnapshot({ username, cards: null, error: error.message })
      })
    return () => controller.abort()
  }, [username, attempt])

  function retry() {
    setSnapshot({ username, cards: null, error: '' })
    setAttempt((current) => current + 1)
  }

  function keyFor(id) {
    return JSON.stringify([username, id])
  }

  async function change(card, saved) {
    const key = keyFor(card.id)
    if (!cards || inFlight.current.has(key)) return

    inFlight.current.add(key)
    setPendingKeys(new Set(inFlight.current))
    try {
      await setBookmark(card.id, saved)
      setSnapshot((current) => {
        if (current.username !== username || !current.cards) return current
        const others = current.cards.filter((item) => item.id !== card.id)
        const entry = { id: card.id, category: card.category, title: card.title, summary: card.summary }
        return { ...current, cards: saved ? [entry, ...others] : others }
      })
    } finally {
      inFlight.current.delete(key)
      setPendingKeys(new Set(inFlight.current))
    }
  }

  return username ? {
    cards, error, retry, change,
    isPending: (id) => pendingKeys.has(keyFor(id)),
  } : null
}

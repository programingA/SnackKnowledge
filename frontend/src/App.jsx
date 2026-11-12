import { useEffect, useState } from 'react'
import { getSession } from './api/account'
import AccountModal from './components/account/AccountModal'
import { articles } from './data/sampleKnowledge'
import AboutModal from './components/layout/AboutModal'
import CuriosityBanner from './components/layout/CuriosityBanner'
import Hero from './components/layout/Hero'
import SiteFooter from './components/layout/SiteFooter'
import SiteHeader from './components/layout/SiteHeader'
import DatabaseArticleModal from './components/knowledge/DatabaseArticleModal'
import KnowledgeFeed from './components/knowledge/KnowledgeFeed'
import SampleArticleModal from './components/knowledge/SampleArticleModal'
import SampleGenerateModal from './components/knowledge/SampleGenerateModal'
import './styles/App.css'

export default function App() {
  const [selected, setSelected] = useState(null)
  const [modal, setModal] = useState(null)
  const [username, setUsername] = useState(null)

  useEffect(() => {
    const controller = new AbortController()
    getSession(controller.signal)
      .then((session) => setUsername(session.username))
      .catch(() => {})
    return () => controller.abort()
  }, [])

  function openArticle(article) {
    setModal(null)
    setSelected(article)
  }

  function closeArticle() {
    setSelected(null)
  }

  function closeModal() {
    setModal(null)
  }

  function scrollToFeed() {
    const reduceMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches
    document.getElementById('knowledge-feed').scrollIntoView({
      behavior: reduceMotion ? 'instant' : 'smooth',
    })
  }

  function openRandomArticle() {
    const index = Math.floor(Math.random() * articles.length)
    openArticle(articles[index])
  }

  return (
    <>
      <a className="skip-link" href="#knowledge-feed">
        지식 목록으로 바로가기
      </a>
      <SiteHeader
        onBrowse={scrollToFeed}
        onAbout={() => setModal('about')}
        onAccount={() => setModal('account')}
        username={username}
      />
      <main className="page-shell">
        <Hero
          onBrowse={scrollToFeed}
          onRandom={openRandomArticle}
          onFeatured={() => openArticle(articles[0])}
        />
        <KnowledgeFeed
          onOpenArticle={(article) =>
            openArticle({ ...article, source: 'database' })
          }
        />
        <CuriosityBanner onGenerate={() => setModal('generate')} />
        <div className="closing-note">
          어제보다 조금 더 넓어진 세상.<span>오늘도 한 입, 잘 먹었습니다.</span>
        </div>
      </main>
      <SiteFooter />

      {selected &&
        (selected.source === 'database' ? (
          <DatabaseArticleModal
            key={selected.id}
            id={selected.id}
            onClose={closeArticle}
          />
        ) : (
          <SampleArticleModal
            key={selected.id}
            article={selected}
            onClose={closeArticle}
          />
        ))}
      {modal === 'generate' && (
        <SampleGenerateModal onClose={closeModal} />
      )}
      {modal === 'account' && (
        <AccountModal
          username={username}
          onChange={setUsername}
          onClose={() => setModal(null)}
        />
      )}
      {modal === 'about' && (
        <AboutModal
          onClose={closeModal}
          onBrowse={() => {
            closeModal()
            scrollToFeed()
          }}
        />
      )}
    </>
  )
}

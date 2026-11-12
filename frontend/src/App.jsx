import { useEffect, useState } from 'react'
import { getSession } from './api/account'
import { getKnowledgeList } from './api/knowledge'
import AccountModal from './components/account/AccountModal'
import InterestSettingsPage from './components/account/InterestSettingsPage'
import MyPage from './components/account/MyPage'
import BookmarksPage from './components/knowledge/BookmarksPage'
import LearningHistoryPage from './components/knowledge/LearningHistoryPage'
import SavedGeneratedCardsPage from './components/knowledge/SavedGeneratedCardsPage'
import WrongAnswersPage from './components/knowledge/WrongAnswersPage'
import { articles } from './data/sampleKnowledge'
import AboutModal from './components/layout/AboutModal'
import CuriosityBanner from './components/layout/CuriosityBanner'
import Hero from './components/layout/Hero'
import SiteFooter from './components/layout/SiteFooter'
import CommunityPage from './components/knowledge/CommunityPage'
import SiteHeader from './components/layout/SiteHeader'
import DatabaseArticlePage from './components/knowledge/DatabaseArticlePage'
import KnowledgeFeed from './components/knowledge/KnowledgeFeed'
import KnowledgeRecommendations from './components/knowledge/KnowledgeRecommendations'
import SampleArticlePage from './components/knowledge/SampleArticlePage'
import SampleGenerateModal from './components/knowledge/SampleGenerateModal'
import GeneratedPreviewPage from './components/knowledge/GeneratedPreviewPage'
import './styles/App.css'

export default function App() {
  const [modal, setModal] = useState(null)
  const [preview, setPreview] = useState(null)
  const [knowledge, setKnowledge] = useState({ cards: null, featured: null, error: '' })
  const [username, setUsername] = useState(null)
  const [locationHash, setLocationHash] = useState(() => window.location.hash)
  const databaseId = locationHash.match(/^#\/knowledge\/(\d+)$/)?.[1]
  const sampleId = locationHash.match(/^#\/sample\/([a-z]+)$/)?.[1]
  const sample = articles.find((article) => article.id === sampleId)
  const isGeneratedPreview = locationHash === '#/generated-preview'
  const isBookmarksPage = locationHash === '#/bookmarks'
  const isLearningHistoryPage = locationHash === '#/learning-history'
  const isWrongAnswersPage = locationHash === '#/wrong-answers'
  const isInterestsPage = locationHash === '#/interests'
  const isMyPage = locationHash === '#/my-page'
  const generatedCardRoute = locationHash.match(/^#\/generated-cards(?:\/([0-9a-f-]{36}))?$/i)
  const communityRoute = locationHash.match(/^#\/community(?:\/([0-9a-f-]{36}))?$/i)
  const focusedPageId = isGeneratedPreview ? 'generated-preview-page'
    : databaseId || sample ? 'article-page'
    : communityRoute ? 'community-page'
    : isBookmarksPage ? 'bookmarks-page'
    : isLearningHistoryPage ? 'learning-history-page'
      : generatedCardRoute ? 'generated-cards-page'
        : isWrongAnswersPage ? 'wrong-answers-page'
          : isInterestsPage ? 'interests-page'
            : isMyPage ? 'my-page' : null

  useEffect(() => {
    const controller = new AbortController()
    getSession(controller.signal)
      .then((session) => setUsername(session.username))
      .catch(() => {})
    return () => controller.abort()
  }, [])

  useEffect(() => {
    function handleHashChange() {
      setLocationHash(window.location.hash)
      setModal(null)
    }
    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [])

  useEffect(() => {
    if (focusedPageId) {
      window.scrollTo(0, 0)
      document.getElementById(focusedPageId)?.focus({ preventScroll: true })
    } else if (locationHash === '#knowledge-feed') {
      document.getElementById('knowledge-feed')?.scrollIntoView()
    }
  }, [focusedPageId, locationHash, preview?.revision])

  function openArticle(card) {
    window.location.hash = '/knowledge/' + card.id
  }

  function closeModal() {
    setModal(null)
  }

  useEffect(() => {
    const controller = new AbortController()
    getKnowledgeList(controller.signal)
      .then((cards) => {
        if (controller.signal.aborted) return
        const featured = cards[Math.floor(Math.random() * cards.length)] ?? null
        setKnowledge({ cards, featured, error: '' })
      })
      .catch((error) => {
        if (!controller.signal.aborted) setKnowledge({ cards: null, featured: null, error: error.message })
      })
    return () => controller.abort()
  }, [])

  function showGeneratedCard(card) {
    setPreview((current) => ({ card, revision: (current?.revision ?? 0) + 1 }))
    setModal(null)
    window.location.hash = '/generated-preview'
  }

  function scrollToFeed() {
    if (focusedPageId) {
      window.location.hash = 'knowledge-feed'
      return
    }
    const reduceMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches
    document.getElementById('knowledge-feed').scrollIntoView({
      behavior: reduceMotion ? 'instant' : 'smooth',
    })
  }

  function openRandomArticle() {
    if (!knowledge.cards?.length) return
    const candidates = knowledge.cards.length > 1
      ? knowledge.cards.filter((card) => card.id !== knowledge.featured?.id)
      : knowledge.cards
    const card = candidates[Math.floor(Math.random() * candidates.length)]
    window.location.hash = '/knowledge/' + card.id
  }

  function openAccount() {
    if (username) window.location.hash = '/my-page'
    else setModal('account')
  }

  return (
    <>
      {!focusedPageId && (
        <a className="skip-link" href="#knowledge-feed">지식 목록으로 바로가기</a>
      )}
      <SiteHeader
        isCommunity={Boolean(communityRoute)}
        onBrowse={scrollToFeed}
        onAbout={() => setModal('about')}
        onAccount={openAccount}
        username={username}
      />
      {(databaseId || sample) && (
        <main className="page-shell article-page" id="article-page" tabIndex={-1}>
          <a className="article-back" href="#knowledge-feed">← 지식 목록으로</a>
          {databaseId ? (
            <DatabaseArticlePage key={databaseId} id={databaseId} username={username} />
          ) : (
            <SampleArticlePage key={sample.id} article={sample} />
          )}
        </main>
      )}
      {isBookmarksPage && (
        <BookmarksPage
          username={username}
          onSignIn={() => setModal('account')}
          onOpenArticle={openArticle}
        />
      )}
      {isLearningHistoryPage && (
        <LearningHistoryPage
          username={username}
          onSignIn={() => setModal('account')}
          onOpenArticle={openArticle}
        />
      )}
      {generatedCardRoute && (
        <SavedGeneratedCardsPage
          username={username}
          id={generatedCardRoute[1]}
          onSignIn={() => setModal('account')}
        />
      )}
      {isWrongAnswersPage && (
        <WrongAnswersPage username={username} onSignIn={() => setModal('account')} />
      )}
      {isInterestsPage && (
        <InterestSettingsPage username={username} onSignIn={() => setModal('account')} />
      )}
      {isMyPage && (
        <MyPage
          username={username}
          onSignIn={() => setModal('account')}
          onSignedOut={() => {
            setUsername(null)
            window.location.hash = 'knowledge-feed'
          }}
        />
      )}
      {communityRoute && <CommunityPage id={communityRoute[1]} />}

      {(isGeneratedPreview || preview) && (
        <GeneratedPreviewPage
          key={preview?.revision ?? 0}
          card={preview?.card}
          username={username}
          visible={isGeneratedPreview}
          onGenerate={() => setModal('generate')}
        />
      )}

      <main className="page-shell" hidden={Boolean(focusedPageId)}>
        <Hero
          onBrowse={scrollToFeed}
          onRandom={knowledge.cards?.length ? openRandomArticle : undefined}
          featured={knowledge.featured}
          featuredStatus={knowledge.error ? '지식을 불러오지 못했어요.' : knowledge.cards ? '등록된 지식이 없어요.' : '지식을 불러오는 중이에요.'}
        />
        {username && !focusedPageId && (
          <KnowledgeRecommendations
            key={username}
            onOpenArticle={openArticle}
          />
        )}
        <KnowledgeFeed cards={knowledge.cards} error={knowledge.error} />
        <CuriosityBanner onGenerate={() => setModal('generate')} />
        <div className="closing-note">
          어제보다 조금 더 넓어진 세상.<span>오늘도 한 입, 잘 먹었습니다.</span>
        </div>
      </main>
      <SiteFooter />

      {modal === 'generate' && (
        <SampleGenerateModal onGenerated={showGeneratedCard} onClose={closeModal} />
      )}
      {modal === 'account' && !username && (
        <AccountModal
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

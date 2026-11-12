import { useEffect, useState } from 'react'
import { getSession } from './api/account'
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
import CommunityReviewPage from './components/knowledge/CommunityReviewPage'
import SiteHeader from './components/layout/SiteHeader'
import DatabaseArticleModal from './components/knowledge/DatabaseArticleModal'
import KnowledgeFeed from './components/knowledge/KnowledgeFeed'
import KnowledgeRecommendations from './components/knowledge/KnowledgeRecommendations'
import SampleArticleModal from './components/knowledge/SampleArticleModal'
import SampleGenerateModal from './components/knowledge/SampleGenerateModal'
import './styles/App.css'

export default function App() {
  const [selected, setSelected] = useState(null)
  const [modal, setModal] = useState(null)
  const [session, setSession] = useState(null)
  const username = session?.username
  const [locationHash, setLocationHash] = useState(() => window.location.hash)
  const [listRevision, setListRevision] = useState(0)
  const isBookmarksPage = locationHash === '#/bookmarks'
  const isLearningHistoryPage = locationHash === '#/learning-history'
  const isWrongAnswersPage = locationHash === '#/wrong-answers'
  const isInterestsPage = locationHash === '#/interests'
  const isMyPage = locationHash === '#/my-page'
  const generatedCardRoute = locationHash.match(/^#\/generated-cards(?:\/([0-9a-f-]{36}))?$/i)
  const communityRoute = locationHash.match(/^#\/community(?:\/([0-9a-f-]{36}))?$/i)
  const reviewRoute = locationHash.match(/^#\/community-review(?:\/([0-9a-f-]{36}))?$/i)
  const focusedPageId = reviewRoute ? 'community-review-page'
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
      .then(setSession)
      .catch(() => {})
    return () => controller.abort()
  }, [])

  useEffect(() => {
    function handleHashChange() {
      setLocationHash(window.location.hash)
      setSelected(null)
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
  }, [focusedPageId, locationHash])

  function openArticle(article) {
    setModal(null)
    setSelected(article)
  }

  function closeArticle() {
    setSelected(null)
    if (focusedPageId) setListRevision((current) => current + 1)
  }

  function closeModal() {
    setModal(null)
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
    const index = Math.floor(Math.random() * articles.length)
    openArticle(articles[index])
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
      {isBookmarksPage && (
        <BookmarksPage
          key={listRevision}
          username={username}
          onSignIn={() => setModal('account')}
          onOpenArticle={(card) => openArticle({ ...card, source: 'database' })}
        />
      )}
      {isLearningHistoryPage && (
        <LearningHistoryPage
          key={listRevision}
          username={username}
          onSignIn={() => setModal('account')}
          onOpenArticle={(card) => openArticle({ ...card, source: 'database' })}
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
          canReviewCommunity={session?.canReviewCommunity}
          onSignIn={() => setModal('account')}
          onSignedOut={() => {
            setSession(null)
            window.location.hash = 'knowledge-feed'
          }}
        />
      )}
      {communityRoute && <CommunityPage id={communityRoute[1]} />}
      {reviewRoute && <CommunityReviewPage id={reviewRoute[1]} />}

      <main className="page-shell" hidden={Boolean(focusedPageId)}>
        <Hero
          onBrowse={scrollToFeed}
          onRandom={openRandomArticle}
          onFeatured={() => openArticle(articles[0])}
        />
        {username && !focusedPageId && (
          <KnowledgeRecommendations
            key={username}
            paused={Boolean(selected)}
            onOpenArticle={(card) => openArticle({ ...card, source: 'database' })}
          />
        )}
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
            username={username}
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
        <SampleGenerateModal username={username} onClose={closeModal} />
      )}
      {modal === 'account' && !username && (
        <AccountModal
          onChange={setSession}
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

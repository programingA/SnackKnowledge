import { useEffect, useRef, useState } from 'react'
import { getSession, signOut } from './api/account'
import { getKnowledgeList } from './api/knowledge'
import useApiQuery from './api/useApiQuery'
import { loadGeneratedPreview, storeGeneratedPreview } from './api/generatedPreviewStorage'
import AccountModal from './components/account/AccountModal'
import InterestSettingsPage from './components/account/InterestSettingsPage'
import MyPage from './components/account/MyPage'
import BookmarksPage from './components/knowledge/BookmarksPage'
import LearningHistoryPage from './components/knowledge/LearningHistoryPage'
import SavedGeneratedCardsPage from './components/knowledge/SavedGeneratedCardsPage'
import WrongAnswersPage from './components/knowledge/WrongAnswersPage'
import { articles } from './data/sampleKnowledge'
import AboutPage from './components/layout/AboutPage'
import CuriosityBanner from './components/layout/CuriosityBanner'
import Hero from './components/layout/Hero'
import SiteFooter from './components/layout/SiteFooter'
import CommunityPage from './components/knowledge/CommunityPage'
import SiteHeader from './components/layout/SiteHeader'
import DatabaseArticlePage from './components/knowledge/DatabaseArticlePage'
import KnowledgeFeed from './components/knowledge/KnowledgeFeed'
import useKnowledgeBookmarks from './components/knowledge/useKnowledgeBookmarks'
import KnowledgeRecommendations from './components/knowledge/KnowledgeRecommendations'
import SampleArticlePage from './components/knowledge/SampleArticlePage'
import SampleGenerateModal from './components/knowledge/SampleGenerateModal'
import GeneratedPreviewPage from './components/knowledge/GeneratedPreviewPage'
import LoadError from './components/ui/LoadError'
import './styles/App.css'

function focusPageTarget(element) {
  if (!element) return
  element.tabIndex = -1
  element.focus({ preventScroll: true })
}

export default function App() {
  const [modal, setModal] = useState(null)
  const [preview, setPreview] = useState(null)
  const [previewLoading, setPreviewLoading] = useState(true)
  const [knowledge, setKnowledge] = useState({ cards: null, featured: null, error: false })
  const [knowledgeAttempt, setKnowledgeAttempt] = useState(0)
  const [accountOverride, setAccountOverride] = useState(null)
  const { data: session, error: sessionError, retry: retrySession } = useApiQuery(getSession, undefined, !accountOverride)
  const username = (accountOverride ?? session)?.username ?? null
  const sessionLoading = !accountOverride && !session && !sessionError
  const [signingOut, setSigningOut] = useState(false)
  const [signOutError, setSignOutError] = useState('')
  const [locationHash, setLocationHash] = useState(() => window.location.hash)
  const previousHash = useRef(locationHash)
  const databaseId = locationHash.match(/^#\/knowledge\/(\d+)$/)?.[1]
  const sampleId = locationHash.match(/^#\/sample\/([a-z]+)$/)?.[1]
  const sample = articles.find((article) => article.id === sampleId)
  const bookmarks = useKnowledgeBookmarks(username)
  const isGeneratedPreview = locationHash === '#/generated-preview'
  const previewRevision = isGeneratedPreview ? preview?.revision : undefined
  const isBookmarksPage = locationHash === '#/bookmarks'
  const isLearningHistoryPage = locationHash === '#/learning-history'
  const isWrongAnswersPage = locationHash === '#/wrong-answers'
  const isInterestsPage = locationHash === '#/interests'
  const isMyPage = locationHash === '#/my-page'
  const isAboutPage = locationHash === '#/about'
  const generatedCardRoute = locationHash.match(/^#\/generated-cards(?:\/([0-9a-f-]{36}))?$/i)
  const communityRoute = locationHash.match(/^#\/community(?:\/([0-9a-f-]{36}))?$/i)
  const isMemberSubpage = isBookmarksPage || isLearningHistoryPage || isWrongAnswersPage
    || isInterestsPage || Boolean(generatedCardRoute)
  const isAccountPage = isMyPage || isMemberSubpage
  const showAccountPage = isAccountPage && !sessionLoading && !sessionError
  const focusedPageId = isAboutPage ? 'about-page'
    : isGeneratedPreview ? 'generated-preview-page'
    : databaseId || sample ? 'article-page'
    : communityRoute ? 'community-page'
    : isBookmarksPage ? 'bookmarks-page'
    : isLearningHistoryPage ? 'learning-history-page'
      : generatedCardRoute ? 'generated-cards-page'
        : isWrongAnswersPage ? 'wrong-answers-page'
          : isInterestsPage ? 'interests-page'
            : isMyPage ? 'my-page' : null

  useEffect(() => {
    function handleHashChange() {
      setLocationHash(window.location.hash)
      setModal(null)
    }
    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [])

  useEffect(() => {
    const hashChanged = previousHash.current !== locationHash
    previousHash.current = locationHash

    if (focusedPageId) {
      const page = document.getElementById(focusedPageId)
      if (!page) return

      window.scrollTo(0, 0)
      let target = page.querySelector('h1') ?? page
      focusPageTarget(target)

      // Data can replace the loading view or the signed-out heading.
      const observer = new MutationObserver(() => {
        const active = document.activeElement
        if (active !== target && (target.isConnected || active !== document.body)) {
          observer.disconnect()
          return
        }
        const nextTarget = page.querySelector('h1') ?? page
        if (nextTarget !== target) {
          target = nextTarget
          focusPageTarget(target)
        }
      })
      observer.observe(page, { childList: true, subtree: true })
      return () => observer.disconnect()
    }

    if (locationHash === '#knowledge-feed') {
      document.getElementById('knowledge-feed')?.scrollIntoView()
      focusPageTarget(document.getElementById('feed-title'))
    } else if (hashChanged) {
      window.scrollTo(0, 0)
      focusPageTarget(document.getElementById('hero-title'))
    }
  }, [focusedPageId, locationHash, previewRevision, showAccountPage])

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
        setKnowledge({ cards, featured, error: false })
      })
      .catch(() => {
        if (!controller.signal.aborted) setKnowledge({ cards: null, featured: null, error: true })
      })
    return () => controller.abort()
  }, [knowledgeAttempt])

  function retryKnowledge() {
    focusPageTarget(document.getElementById('feed-title'))
    setKnowledge({ cards: null, featured: null, error: false })
    setKnowledgeAttempt((attempt) => attempt + 1)
  }

  useEffect(() => {
    let active = true
    loadGeneratedPreview().then((card) => {
      if (active && card) setPreview((current) => current ?? { card, revision: 1, restored: true })
    }).catch(() => {}).finally(() => {
      if (active) setPreviewLoading(false)
    })
    return () => { active = false }
  }, [])

  async function showGeneratedCard(card) {
    let storageWarning = ''
    try {
      await storeGeneratedPreview(card)
    } catch {
      storageWarning = '브라우저에 미리보기를 보관하지 못했어요. 새로고침 전에 카드를 저장해 주세요.'
    }
    setPreview((current) => ({ card, storageWarning, revision: (current?.revision ?? 0) + 1 }))
    setModal(null)
    window.location.hash = '/generated-preview'
  }

  function scrollToFeed() {
    if (focusedPageId) {
      window.location.hash = isAboutPage ? '' : 'knowledge-feed'
      return
    }
    const reduceMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches
    document.getElementById('knowledge-feed').scrollIntoView({
      behavior: reduceMotion ? 'instant' : 'smooth',
    })
    focusPageTarget(document.getElementById('feed-title'))
  }

  function openRandomArticle() {
    if (!knowledge.cards?.length) return
    const candidates = knowledge.cards.length > 1
      ? knowledge.cards.filter((card) => card.id !== knowledge.featured?.id)
      : knowledge.cards
    const card = candidates[Math.floor(Math.random() * candidates.length)]
    window.location.hash = '/knowledge/' + card.id
  }

  async function handleSignOut() {
    if (signingOut) return
    setSigningOut(true)
    setSignOutError('')
    try {
      await signOut()
      setAccountOverride({ username: null })
      if (window.location.hash === '#/my-page') window.location.hash = 'knowledge-feed'
    } catch (error) {
      setSignOutError(error.message)
    } finally {
      setSigningOut(false)
    }
  }

  return (
    <>
      {!focusedPageId && (
        <a className="skip-link" href="#knowledge-feed">지식 목록으로 바로가기</a>
      )}
      <SiteHeader
        isCommunity={Boolean(communityRoute)}
        onBrowse={scrollToFeed}
        isAboutPage={isAboutPage}
        onAccount={() => setModal('account')}
        isMyPage={isMyPage}
        isMemberSubpage={isMemberSubpage}
        onSignOut={handleSignOut}
        signingOut={signingOut}
        signOutError={signOutError}
        username={username}
      />
      {isAccountPage && !showAccountPage && (
        <main className="page-shell session-status" id={focusedPageId} tabIndex={-1}>
          {sessionError ? (
            <LoadError heading="h1" message="로그인 상태를 확인하지 못했어요." onRetry={retrySession} />
          ) : <p role="status">로그인 상태를 확인하는 중이에요.</p>}
        </main>
      )}
      {!isAccountPage && sessionError && (
        <div className="page-shell session-status">
          <LoadError message="로그인 상태를 확인하지 못했어요." onRetry={retrySession} />
        </div>
      )}
      {(databaseId || sample) && (
        <main className="page-shell article-page" id="article-page" tabIndex={-1}>
          {databaseId ? (
            <DatabaseArticlePage key={databaseId} id={databaseId} username={username} bookmarks={bookmarks} />
          ) : (
            <SampleArticlePage key={sample.id} article={sample} />
          )}
        </main>
      )}
      {showAccountPage && isBookmarksPage && (
        <BookmarksPage
          bookmarks={bookmarks}
          onSignIn={() => setModal('account')}
        />
      )}
      {showAccountPage && isLearningHistoryPage && (
        <LearningHistoryPage
          username={username}
          onSignIn={() => setModal('account')}
          onOpenArticle={openArticle}
        />
      )}
      {showAccountPage && generatedCardRoute && (
        <SavedGeneratedCardsPage
          username={username}
          id={generatedCardRoute[1]}
          onSignIn={() => setModal('account')}
        />
      )}
      {showAccountPage && isWrongAnswersPage && (
        <WrongAnswersPage username={username} onSignIn={() => setModal('account')} />
      )}
      {showAccountPage && isInterestsPage && (
        <InterestSettingsPage username={username} onSignIn={() => setModal('account')} />
      )}
      {showAccountPage && isMyPage && (
        <MyPage
          username={username}
          onSignIn={() => setModal('account')}
        />
      )}
      {communityRoute && <CommunityPage id={communityRoute[1]} />}

      {(isGeneratedPreview || preview) && (
        <GeneratedPreviewPage
          key={preview?.revision ?? 0}
          card={preview?.card}
          restored={preview?.restored}
          storageWarning={preview?.storageWarning}
          loading={previewLoading}
          username={username}
          visible={isGeneratedPreview}
          onSignIn={() => setModal('account')}
          onGenerate={() => setModal('generate')}
        />
      )}

      {isAboutPage && <AboutPage onGenerate={() => setModal('generate')} />}
      <main className="page-shell home" hidden={Boolean(focusedPageId)}>
        <Hero
          onBrowse={scrollToFeed}
          onRandom={knowledge.cards?.length ? openRandomArticle : undefined}
          featured={knowledge.featured}
          bookmarks={bookmarks}
          featuredStatus={knowledge.error ? '지식을 불러오지 못했어요.' : knowledge.cards ? '등록된 지식이 없어요.' : '지식을 불러오는 중이에요.'}
        />
        {username && !focusedPageId && (
          <KnowledgeRecommendations
            key={username}
            bookmarks={bookmarks}
          />
        )}
        <KnowledgeFeed cards={knowledge.cards} error={knowledge.error} bookmarks={bookmarks} onRetry={retryKnowledge} />
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
          onChange={(username) => setAccountOverride({ username })}
          onClose={() => setModal(null)}
        />
      )}
    </>
  )
}

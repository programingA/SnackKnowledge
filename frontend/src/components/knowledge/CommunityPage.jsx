import { getCommunityCard, getCommunityCards } from '../../api/community'
import useApiQuery from '../../api/useApiQuery'
import LoadError from '../ui/LoadError'
import LoadingSkeleton from '../ui/LoadingSkeleton'
import GeneratedArticle from './GeneratedArticle'
import KnowledgeCard from './KnowledgeCard'
import useArticleBackLinkRef from './useArticleBackLinkRef'

export default function CommunityPage({ id }) {
  return (
    <main className={id ? "page-shell article-page" : "page-shell generated-cards-page"} id="community-page" tabIndex={-1}>
      {!id && <h1>커뮤니티</h1>}
      <CommunityCards key={id ?? 'list'} id={id} />
    </main>
  )
}

function loadCommunityCards(signal, id) {
  return id ? getCommunityCard(id, signal) : getCommunityCards(signal)
}

function CommunityCards({ id }) {
  const { data, error, retry } = useApiQuery(loadCommunityCards, id)
  const backLinkRef = useArticleBackLinkRef()
  const backLink = id && <a className="article-back" href="#/community" ref={backLinkRef}>← 커뮤니티 목록으로</a>
  const errorMessage = id ? '공개 카드를 불러오지 못했어요.' : '커뮤니티 목록을 불러오지 못했어요.'

  if (error || data === null) return (
    <>
      {backLink}
      {error ? (
        <LoadError heading={id ? 'h1' : 'h2'} message={id && error.status === 404 ? error.message : errorMessage}
          onRetry={retry} />
      ) : <LoadingSkeleton layout={id ? 'article' : 'rows'} label="커뮤니티 카드를 불러오는 중이에요." />}
    </>
  )
  if (id) return <GeneratedArticle card={data} studyPath={`/api/study/generated/community/${id}`} headerActions={backLink} />
  if (!data.length) return <p className="generated-cards-panel">아직 공개된 카드가 없어요.</p>

  return (
    <ul className="knowledge-card-list" role="list">
      {data.map((card) => (
        <li key={card.id}>
          <KnowledgeCard card={card} href={`#/community/${card.id}`} heading="h2" />
        </li>
      ))}
    </ul>
  )
}

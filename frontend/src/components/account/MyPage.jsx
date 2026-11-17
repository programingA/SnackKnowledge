import { getMemberOverview } from '../../api/memberOverview'
import useApiQuery from '../../api/useApiQuery'
import Icon from '../ui/Icon'
import LoadError from '../ui/LoadError'
import LoadingSkeleton from '../ui/LoadingSkeleton'
import './MyPage.css'

const destinations = [
  { route: 'bookmarks', title: '북마크', icon: 'book', key: 'bookmarks', unit: '장', description: '저장한 지식 카드' },
  { route: 'learning-history', title: '학습 기록', icon: 'clock', key: 'learningActivities', unit: '개', description: '읽기·질문·퀴즈·설명 활동' },
  { route: 'generated-cards', title: '생성한 카드', icon: 'sparkle', key: 'generatedCards', unit: '장', description: '보관한 AI 지식 카드' },
  { route: 'wrong-answers', title: '오답 노트', icon: 'check', key: 'wrongAnswers', unit: '개', description: '다시 풀 수 있는 문제' },
]

export default function MyPage({ username, onSignIn }) {
  return (
    <main className="page-shell my-page" id="my-page" tabIndex={-1}>
      <h1>마이페이지</h1>
      {username ? <MemberDashboard key={username} username={username} /> : (
        <div className="my-page-panel">
          <p>로그인하면 내 카드와 학습 활동을 볼 수 있어요.</p>
          <button className="primary-button" type="button" onClick={onSignIn}>로그인</button>
        </div>
      )}
    </main>
  )
}

function MemberDashboard({ username }) {
  const { data: overview, error, retry } = useApiQuery(getMemberOverview)

  return (
    <>
      <div className="my-page-panel my-page-member">
        <p><strong>{username}</strong>님</p>
      </div>
      {error && <LoadError message="내 활동을 불러오지 못했어요." onRetry={retry} />}
      {!overview && !error && <LoadingSkeleton label="내 활동을 불러오는 중이에요." />}
      <ul className="my-page-grid" aria-label="내 활동">
        {destinations.map(({ route, title, icon, key, unit, description }) => (
          <li key={route}>
            <a className="my-page-panel my-page-card" href={'#/' + route}>
              <span className="my-page-icon"><Icon name={icon} size={20} /></span>
              <span className="my-page-card-copy">
                <strong>{title}</strong>
                <span>{description}</span>
              </span>
              {overview && <span className="my-page-count">{overview[key]}{unit}</span>}
            </a>
          </li>
        ))}
      </ul>
      <div className="my-page-panel my-page-interests">
        <div className="my-page-interests-heading">
          <h2>관심 분야</h2>
          <a className="primary-button primary-button--compact" href="#/interests">관심 분야 설정 <Icon name="arrow" size={16} /></a>
        </div>
        {overview && (overview.interests.length ? (
          <ul aria-label="선택한 관심 분야">
            {overview.interests.map((category) => <li key={category}>{category}</li>)}
          </ul>
        ) : <p>아직 선택한 분야가 없어요.</p>)}
      </div>
    </>
  )
}

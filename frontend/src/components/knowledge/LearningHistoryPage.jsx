import { getLearningHistory } from '../../api/learningHistory'
import useApiQuery from '../../api/useApiQuery'
import LoadError from '../ui/LoadError'
import LoadingSkeleton from '../ui/LoadingSkeleton'
import './LearningHistory.css'

const activityLabels = {
  read: '지식 읽기',
  question: 'AI에게 질문',
  quiz: '퀴즈 완료',
  explanation: '설명 피드백',
}

const dateFormat = new Intl.DateTimeFormat('ko-KR', { dateStyle: 'medium', timeStyle: 'short' })

export default function LearningHistoryPage({ username, onSignIn, onOpenArticle }) {
  return (
    <main className="page-shell learning-page" id="learning-history-page" tabIndex={-1}>
      <h1>학습 기록</h1>
      {username ? <LearningHistoryList key={username} onOpenArticle={onOpenArticle} /> : (
        <div className="learning-state">
          <p>로그인하면 카드별로 최근에 한 학습 활동을 볼 수 있어요.</p>
          <button type="button" className="primary-button" onClick={onSignIn}>로그인</button>
        </div>
      )}
    </main>
  )
}

function LearningHistoryList({ onOpenArticle }) {
  const { data: records, error, retry } = useApiQuery(getLearningHistory)

  if (error) {
    return <LoadError message="학습 기록을 불러오지 못했어요." onRetry={retry} />
  }
  if (records === null) return <LoadingSkeleton layout="rows" label="학습 기록을 불러오는 중이에요." />
  if (!records.length) return <p className="learning-state">아직 학습 기록이 없어요. 지식 카드부터 읽어보세요.</p>

  return (
    <ul className="learning-list">
      {records.map(({ id, title, activity, learnedAt }) => (
        <li key={id + ':' + activity}>
          <div>
            <span className="learning-activity">{activityLabels[activity]}</span>
            <h2><button type="button" onClick={() => onOpenArticle({ id, title })}>{title}</button></h2>
          </div>
          <time dateTime={learnedAt}>{dateFormat.format(new Date(learnedAt))}</time>
        </li>
      ))}
    </ul>
  )
}

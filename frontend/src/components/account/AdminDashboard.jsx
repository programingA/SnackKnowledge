import { useState } from 'react'
import { getAdminOverview } from '../../api/admin'
import useApiQuery from '../../api/useApiQuery'
import CardPagination, { CARDS_PER_PAGE } from '../knowledge/CardPagination'
import Icon from '../ui/Icon'
import LoadError from '../ui/LoadError'
import LoadingSkeleton from '../ui/LoadingSkeleton'
import './AdminDashboard.css'

const numberFormat = new Intl.NumberFormat('ko-KR')
const dateFormat = new Intl.DateTimeFormat('ko-KR', { dateStyle: 'medium', timeStyle: 'short' })

export function AdminHeader({ username, onSignOut, signingOut, signOutError }) {
  return (
    <header className="site-header">
      <div className="page-shell admin-header">
        <a className="admin-home-link" href="#/admin">한입지식 관리자</a>
        <div className="header-account">
          <span className="header-username" title={username}>{username}</span>
          <button type="button" className="account-button" disabled={signingOut} onClick={onSignOut}>
            {signingOut ? '로그아웃 중…' : '로그아웃'}
          </button>
          {signOutError && <p className="header-account-error" role="alert">{signOutError}</p>}
        </div>
      </div>
    </header>
  )
}

export default function AdminDashboard() {
  const { data, error, retry } = useApiQuery(getAdminOverview)
  const [page, setPage] = useState(1)

  return (
    <main className="page-shell admin-dashboard" id="admin-dashboard" tabIndex={-1}>
      <h1>관리자 대시보드</h1>
      {error && <LoadError message={error.message} onRetry={retry} />}
      {!data && !error && <LoadingSkeleton label="관리자 통계를 불러오는 중이에요." />}
      {data && (
        <section className="admin-usage" aria-label="회원 및 AI 사용 통계">
          <dl className="admin-metrics">
            <div><dt>가입 회원</dt><dd>{numberFormat.format(data.members)}명</dd></div>
            <div><dt>저장된 생성 카드</dt><dd>{numberFormat.format(data.generatedCards)}개</dd></div>
            <div><dt>AI가 답변한 질문</dt><dd>{numberFormat.format(data.usage.answeredQuestions)}건</dd></div>
            <div>
              <dt>AI 사용 토큰</dt><dd>{numberFormat.format(data.usage.totalTokens)}</dd>
              <dd className="admin-metric-detail">입력 {numberFormat.format(data.usage.inputTokens)} · 출력 {numberFormat.format(data.usage.outputTokens)}</dd>
            </div>
          </dl>
          <p className="admin-metric-note">
            AI 통계는 {dateFormat.format(new Date(data.usage.trackingStartedAt))}부터 집계했으며 비로그인 이용도 포함해요.
          </p>
        </section>
      )}
      {data && <PendingReviews reviews={data.pendingReviews} page={page} onPageChange={setPage} />}
    </main>
  )
}

function PendingReviews({ reviews, page, onPageChange }) {
  const pageCount = Math.ceil(reviews.length / CARDS_PER_PAGE)
  const currentPage = Math.min(page, Math.max(1, pageCount))
  const start = (currentPage - 1) * CARDS_PER_PAGE

  return (
    <section className="admin-review-panel" aria-labelledby="admin-review-title">
      <div className="admin-review-heading">
        <h2 id="admin-review-title">커뮤니티 검토</h2>
        <span className="admin-review-count">검토 대기 {numberFormat.format(reviews.length)}건</span>
      </div>
      {reviews.length === 0 ? (
        <p className="admin-review-empty">검토 대기 중인 카드가 없어요.</p>
      ) : (
        <ul className="admin-review-list">
          {reviews.slice(start, start + CARDS_PER_PAGE).map(({ id, title, category, applicant, submittedAt }) => (
            <li key={id}>
              <a className="admin-review-link" href={`#/community-review/${id}`}>
                <span className="admin-review-card">
                  <span className="admin-review-label">{category}</span>
                  <strong>{title}</strong>
                </span>
                <span className="admin-review-meta">
                  <span className="admin-review-label">신청자</span>
                  <span>{applicant}</span>
                </span>
                <span className="admin-review-meta">
                  <span className="admin-review-label">신청 시각</span>
                  <time dateTime={submittedAt}>{dateFormat.format(new Date(submittedAt))}</time>
                </span>
                <Icon name="arrow" size={16} />
              </a>
            </li>
          ))}
        </ul>
      )}
      <CardPagination page={currentPage} pageCount={pageCount} onChange={onPageChange} label="검토 요청 페이지" />
    </section>
  )
}

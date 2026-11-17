export const CARDS_PER_PAGE = 9
const PAGE_GROUP_SIZE = 10

export default function CardPagination({ page, pageCount, onChange, label }) {
  if (pageCount < 2) return null

  const first = Math.floor((page - 1) / PAGE_GROUP_SIZE) * PAGE_GROUP_SIZE + 1
  const last = Math.min(first + PAGE_GROUP_SIZE - 1, pageCount)
  const numbers = Array.from({ length: last - first + 1 }, (_, index) => first + index)

  return (
    <nav className="knowledge-pagination" aria-label={label}>
      <span className="sr-only" role="status">전체 {pageCount}페이지 중 {page}페이지</span>
      <button className="knowledge-page-direction" type="button" aria-label="이전 페이지" disabled={page === 1}
        onClick={() => onChange(page - 1)}>이전</button>
      {numbers.map((number) => (
        <button type="button" key={number} aria-label={`${number}페이지`}
          aria-current={number === page ? 'page' : undefined}
          onClick={() => onChange(number)}>{number}</button>
      ))}
      <button className="knowledge-page-direction" type="button" aria-label="다음 페이지" disabled={page === pageCount}
        onClick={() => onChange(page + 1)}>다음</button>
    </nav>
  )
}

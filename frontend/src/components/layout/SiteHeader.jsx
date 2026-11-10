import Icon from '../ui/Icon'

export default function SiteHeader({ onBrowse, onAbout }) {
  return (
    <header className="site-header">
      <div className="header-inner">
        <a className="brand" href="#" aria-label="한입지식 홈">
          <span className="brand-symbol">
            <Icon name="book" size={23} />
          </span>
          <span>
            한입지식<span className="brand-dot">.</span>
          </span>
        </a>
        <nav aria-label="주 메뉴">
          <button className="nav-active" onClick={onBrowse}>
            지식 둘러보기
          </button>
          <button onClick={onAbout}>한입지식 소개</button>
        </nav>
        <span className="preview-badge">
          <span />
          프론트 미리보기
        </span>
      </div>
    </header>
  )
}

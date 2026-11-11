import Icon from '../ui/Icon'

export default function SiteHeader({ onBrowse, onAbout, onAccount, username }) {
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
        <button type="button" className="account-button" onClick={onAccount}>
          {username ? '내 계정' : '로그인'}
        </button>
      </div>
    </header>
  )
}

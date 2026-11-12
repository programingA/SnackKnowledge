import Icon from '../ui/Icon'

export default function SiteHeader({
  onBrowse, isAboutPage, onAccount, username, isCommunity, isMyPage, onSignOut, signingOut, signOutError,
}) {
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
          <button className={!isAboutPage && !isCommunity && !isMyPage ? 'nav-active' : undefined} onClick={onBrowse}>
            지식 둘러보기
          </button>
          <a href="#/about" aria-current={isAboutPage ? 'page' : undefined}>한입지식 소개</a>
          <a href="#/community" aria-current={isCommunity ? 'page' : undefined}>커뮤니티</a>
          {username && (
            <a href="#/my-page" aria-current={isMyPage ? 'page' : undefined}>마이페이지</a>
          )}
        </nav>
        <div className="header-account">
          {username ? (
            <>
              <span className="header-username" title={username}>{username}</span>
              <button type="button" className="account-button" onClick={onSignOut} disabled={signingOut}>
                {signingOut ? '로그아웃 중…' : '로그아웃'}
              </button>
              {signOutError && <p className="header-account-error" role="alert">{signOutError}</p>}
            </>
          ) : (
            <button type="button" className="account-button" onClick={onAccount}>로그인</button>
          )}
        </div>
      </div>
    </header>
  )
}

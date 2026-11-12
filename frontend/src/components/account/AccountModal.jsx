import { useState } from 'react'
import { registerAccount, signIn, signOut } from '../../api/account'
import Icon from '../ui/Icon'
import Modal from '../ui/Modal'
import './AccountModal.css'

export default function AccountModal({ username, onChange, onClose }) {
  const [registering, setRegistering] = useState(false)
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [confirmation, setConfirmation] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const title = username ? '내 계정' : registering ? '회원가입' : '로그인'

  function changeMode() {
    setRegistering(!registering)
    setPassword('')
    setConfirmation('')
    setShowPassword(false)
    setError('')
    setNotice('')
  }

  async function handleSubmit(event) {
    event.preventDefault()
    if (pending) return
    setError('')
    setNotice('')
    const trimmedName = name.trim()
    if (!username) {
      if (!/^[a-zA-Z0-9_]{3,30}$/.test(trimmedName)) {
        setError('아이디는 영문·숫자·밑줄로 3~30자를 입력해주세요.')
        return
      }
      if (!password || new TextEncoder().encode(password).length > 72) {
        setError('비밀번호를 입력해주세요. UTF-8 기준 72바이트까지 입력할 수 있어요.')
        return
      }
      if (registering && (!password.trim() || [...password].length < 15)) {
        setError('비밀번호는 15자 이상 입력해주세요.')
        return
      }
      if (registering && password !== confirmation) {
        setError('비밀번호 확인이 일치하지 않아요.')
        return
      }
    }
    setPending(true)

    try {
      if (username) {
        await signOut()
        onChange(null)
        onClose()
      } else if (registering) {
        await registerAccount(trimmedName, password, confirmation)
        changeMode()
        setNotice('입력한 아이디로 로그인해보세요. 로그인되지 않으면 다른 아이디로 가입해주세요.')
      } else {
        const session = await signIn(trimmedName, password)
        onChange(session.username)
        onClose()
      }
    } catch (error) {
      setError(error.message)
    } finally {
      setPending(false)
    }
  }

  return (
    <Modal label={title} onClose={onClose} className="account-modal">
      <div className="account-heading">
        <span className="account-icon"><Icon name="book" size={22} /></span>
        <h2>{title}</h2>
      </div>
      <form className="account-form" onSubmit={handleSubmit} noValidate>
        {username ? <p className="account-session"><strong>{username}</strong>님으로 로그인되어 있어요.</p> : (
          <>
            <div className="account-field">
              <label htmlFor="account-username">아이디</label>
              <input
                id="account-username"
                autoComplete="username"
                autoCapitalize="none"
                spellCheck={false}
                value={name}
                onChange={(event) => setName(event.target.value)}
                maxLength={30}
                aria-describedby={registering ? 'account-username-hint' : undefined}
                disabled={pending}
                required
              />
              {registering && <p id="account-username-hint">영문·숫자·밑줄 3~30자</p>}
            </div>
            <div className="account-field">
              <label htmlFor="account-password">비밀번호</label>
              <div className="account-password-control">
                <input
                  id="account-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete={registering ? 'new-password' : 'current-password'}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  maxLength={72}
                  aria-describedby={registering ? 'account-password-hint' : undefined}
                  disabled={pending}
                  required
                />
                <button
                  type="button"
                  aria-label={showPassword ? '비밀번호 숨기기' : '비밀번호 표시'}
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? '숨기기' : '표시'}
                </button>
              </div>
              {registering && <p id="account-password-hint">15자 이상 · 최대 72바이트(한글 24자 분량)</p>}
            </div>
            {registering && (
              <div className="account-field">
                <label htmlFor="account-password-confirmation">비밀번호 확인</label>
                <input
                  id="account-password-confirmation"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={confirmation}
                  onChange={(event) => setConfirmation(event.target.value)}
                  maxLength={72}
                  disabled={pending}
                  required
                />
              </div>
            )}
          </>
        )}
        {error && <p className="account-message account-error" role="alert">{error}</p>}
        {notice && <p className="account-message" role="status">{notice}</p>}
        <button className="primary-button full-width" type="submit" disabled={pending}>
          {pending ? '처리 중...' : username ? '로그아웃' : title}
        </button>
      </form>
      {username && (
        <a className="text-button" href="#/bookmarks" onClick={onClose}>내 북마크</a>
      )}
      {username && (
        <a className="text-button" href="#/learning-history" onClick={onClose}>학습 기록</a>
      )}
      {!username && (
        <div className="account-footer">
          <span>{registering ? '이미 계정이 있나요?' : '처음 오셨나요?'}</span>
          <button className="text-button account-switch" type="button" disabled={pending} onClick={changeMode}>
            {registering ? '로그인' : '회원가입'}
          </button>
        </div>
      )}
    </Modal>
  )
}

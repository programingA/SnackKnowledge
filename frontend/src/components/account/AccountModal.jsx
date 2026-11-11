import { useState } from 'react'
import { registerAccount, signIn, signOut } from '../../api/account'
import Modal from '../ui/Modal'

export default function AccountModal({ username, onChange, onClose }) {
  const [registering, setRegistering] = useState(false)
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [pending, setPending] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const title = username ? '내 계정' : registering ? '회원가입' : '로그인'

  async function handleSubmit(event) {
    event.preventDefault()
    if (pending) return
    setError('')
    setNotice('')
    setPending(true)

    try {
      if (username) {
        await signOut()
        onChange(null)
        onClose()
      } else if (registering) {
        await registerAccount(name.trim(), password)
        setRegistering(false)
        setPassword('')
        setNotice('가입이 완료됐어요. 비밀번호를 입력해 로그인해주세요.')
      } else {
        const session = await signIn(name.trim(), password)
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
    <Modal label={title} onClose={onClose} className="generate-modal">
      <h2>{title}</h2>
      <form onSubmit={handleSubmit}>
        {username ? <p>{username}님으로 로그인되어 있어요.</p> : (
          <>
            <label htmlFor="account-username">아이디</label>
            <input
              id="account-username"
              autoComplete="username"
              value={name}
              onChange={(event) => setName(event.target.value)}
              minLength={3}
              maxLength={30}
              pattern="[a-zA-Z0-9_]{3,30}"
              disabled={pending}
              required
            />
            <label htmlFor="account-password">비밀번호</label>
            <input
              id="account-password"
              type="password"
              autoComplete={registering ? 'new-password' : 'current-password'}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              minLength={registering ? 8 : undefined}
              maxLength={72}
              disabled={pending}
              required
            />
            {registering && <p className="muted">아이디는 영문·숫자·밑줄 3~30자, 비밀번호는 8자 이상 입력해주세요.</p>}
          </>
        )}
        <button className="primary-button full-width" type="submit" disabled={pending}>
          {pending ? '처리 중...' : username ? '로그아웃' : title}
        </button>
        {error && <p role="alert">{error}</p>}
        {notice && <p role="status">{notice}</p>}
      </form>
      {!username && (
        <button
          className="text-button account-switch"
          type="button"
          disabled={pending}
          onClick={() => {
            setRegistering(!registering)
            setPassword('')
            setError('')
            setNotice('')
          }}
        >
          {registering ? '로그인으로 돌아가기' : '회원가입하기'}
        </button>
      )}
    </Modal>
  )
}

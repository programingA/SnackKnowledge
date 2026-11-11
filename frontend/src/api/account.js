async function request(path, options) {
  const response = await fetch('/api/account/' + path, options)
  if (!response.ok) {
    const messages = {
      400: '아이디와 비밀번호 형식을 확인해주세요.',
      401: '아이디 또는 비밀번호를 확인해주세요.',
      403: '요청을 확인하지 못했어요. 다시 시도해주세요.',
      409: '이미 사용 중인 아이디예요.',
    }
    throw new Error(messages[response.status] ?? '계정 요청을 처리하지 못했어요.')
  }
  return response
}

async function submit(path, body, contentType) {
  const tokenResponse = await request('csrf', { cache: 'no-store' })
  const { header, token } = await tokenResponse.json()
  return request(path, {
    method: 'POST',
    headers: { [header]: token, ...(contentType && { 'Content-Type': contentType }) },
    body,
  })
}

export async function getSession(signal) {
  const response = await request('session', { signal, cache: 'no-store' })
  return response.json()
}

export function registerAccount(username, password) {
  return submit('register', JSON.stringify({ username, password }), 'application/json')
}

export async function signIn(username, password) {
  await submit('login', new URLSearchParams({ username, password }), 'application/x-www-form-urlencoded')
  return getSession()
}

export function signOut() {
  return submit('logout')
}

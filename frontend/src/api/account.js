async function request(path, options) {
  const response = await fetch('/api/account/' + path, options)
  if (!response.ok) {
    const messages = {
      400: '아이디와 비밀번호 형식을 확인해주세요.',
      401: '아이디 또는 비밀번호를 확인해주세요.',
      403: '요청을 확인하지 못했어요. 다시 시도해주세요.',
      429: '요청이 너무 많아요. 잠시 후 다시 시도해주세요.',
    }
    throw new Error(messages[response.status] ?? '계정 요청을 처리하지 못했어요.')
  }
  return response
}

export async function getCsrfHeaders(signal) {
  const tokenResponse = await request('csrf', { cache: 'no-store', signal })
  const { header, token } = await tokenResponse.json()
  return { [header]: token }
}

async function submit(path, body, contentType) {
  const csrfHeaders = await getCsrfHeaders()
  return request(path, {
    method: 'POST',
    headers: { ...csrfHeaders, ...(contentType && { 'Content-Type': contentType }) },
    body,
  })
}

export async function getSession(signal) {
  const response = await request('session', { signal, cache: 'no-store' })
  return response.json()
}

export function registerAccount(username, password, passwordConfirmation) {
  return submit('register', JSON.stringify({ username, password, passwordConfirmation }), 'application/json')
}

export async function signIn(username, password) {
  await submit('login', new URLSearchParams({ username, password }), 'application/x-www-form-urlencoded')
  return getSession()
}

export function signOut() {
  return submit('logout')
}

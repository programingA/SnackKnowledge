import { getCsrfHeaders } from './account'

async function request(path, options) {
  const response = await fetch('/api/me/generated-cards' + path, options)
  if (!response.ok) {
    const messages = {
      400: '카드 내용이나 이미지 형식을 확인해주세요.',
      401: '로그인한 뒤 생성한 카드를 보관할 수 있어요.',
      404: '저장한 카드를 찾을 수 없어요.',
      413: '이미지가 너무 커서 저장할 수 없어요.',
    }
    throw new Error(messages[response.status] ?? '카드를 처리하지 못했어요. 다시 시도해주세요.')
  }
  return response
}

export async function getGeneratedCards(signal) {
  return (await request('', { signal })).json()
}

export async function getGeneratedCard(id, signal) {
  return (await request('/' + id, { signal })).json()
}

export async function saveGeneratedCard(id, card) {
  await request('/' + id, {
    method: 'PUT',
    headers: { ...await getCsrfHeaders(), 'Content-Type': 'application/json' },
    body: JSON.stringify(card),
  })
}

export async function deleteGeneratedCard(id) {
  await request('/' + id, { method: 'DELETE', headers: await getCsrfHeaders() })
}

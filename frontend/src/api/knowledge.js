async function fetchKnowledge(path, signal, errorLabel) {
  const response = await fetch(path, { signal })

  if (!response.ok) {
    throw new Error(errorLabel + ' (' + response.status + ')')
  }

  return response.json()
}

export function getKnowledgeList(signal) {
  return fetchKnowledge('/api/knowledge', signal, '조회 실패')
}

export function getKnowledge(id, signal) {
  return fetchKnowledge('/api/knowledge/' + id, signal, '상세 조회 실패')
}

export async function askKnowledgeQuestion(id, question) {
  const response = await fetch(`/api/knowledge/${id}/questions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question }),
  })

  if (!response.ok) {
    throw new Error(`답변을 가져오지 못했어요(${response.status}).`)
  }

  const data = await response.json()
  return data.answer
}

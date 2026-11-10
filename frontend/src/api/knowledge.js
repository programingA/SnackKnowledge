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

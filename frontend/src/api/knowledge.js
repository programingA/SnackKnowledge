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

export async function generateKnowledgeQuiz(id) {
  const response = await fetch(`/api/knowledge/${id}/quiz`, {
    method: 'POST',
  })

  if(!response.ok) {
    throw new Error(`퀴즈를 만들지 못했어요 (${response.status}).`)
  }

  const quiz = await response.json()
  const options = quiz?.options ?? quiz?.option

  if (!Array.isArray(options) || options.length !== 4
      || !Number.isInteger(quiz.correctIndex)
      || quiz.correctIndex < 0 || quiz.correctIndex >= options.length) {
    throw new Error('퀴즈 응답의 보기 또는 정답 위치가 올바르지 않아요.')
  }

  return { ...quiz, options }
}

export async function getExplanationFeedback(id, explanation) {
  const response = await fetch(`/api/knowledge/${id}/explanations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(({explanation})),
  })

  if (!response.ok) {
    throw new Error(`피드백을 가져오지 못했어요(${response.status}).`)
  }

  const data = await response.json()
  return data.feedback
}

export async function generateKnowledge(topic) {
  const response = await fetch('/api/knowledge/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ topic }),
  })

  if (!response.ok) {
    throw new Error(`지식 카드를 생성하지 못했어요(${response.status}).`)
  }

  return response.json()
}

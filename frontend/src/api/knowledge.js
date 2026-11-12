import { getCsrfHeaders } from './account'

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

async function postStudy(studyPath, activity, body) {
  const csrf = studyPath.startsWith('/api/study/') ? await getCsrfHeaders() : {}
  return fetch(studyPath + '/' + activity, {
    method: 'POST',
    headers: body === undefined ? csrf : { ...csrf, 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  })
}

export async function reconnectGeneratedPreview({ category, title, summary, content }, signal) {
  const csrf = await getCsrfHeaders(signal)
  const response = await fetch('/api/study/generated/previews', {
    method: 'POST',
    headers: { ...csrf, 'Content-Type': 'application/json' },
    body: JSON.stringify({ category, title, summary, content }),
    signal,
  })
  if (!response.ok) throw new Error('이 카드의 학습 기능에 연결하지 못했어요.')
  const result = await response.json()
  if (!result.studyId) throw new Error('이 카드의 학습 기능에 연결하지 못했어요.')
  return result.studyId
}

export function getKnowledgeConversation(studyPath, signal) {
  return fetchKnowledge(studyPath + '/questions', signal, '대화를 불러오지 못했어요')
}

export async function askKnowledgeQuestion(studyPath, question) {
  const response = await postStudy(studyPath, 'questions', { question })

  if (!response.ok) {
    const messages = {
      429: '이 카드의 질문 5회를 모두 사용했어요.',
      502: 'AI 답변이 끝까지 생성되지 않았어요. 다시 질문해 주세요.',
    }
    const error = new Error(messages[response.status] ?? `답변을 가져오지 못했어요(${response.status}).`)
    error.status = response.status
    throw error
  }

  const data = await response.json()
  return data.conversation
}

export async function generateKnowledgeQuiz(studyPath) {
  const response = await postStudy(studyPath, 'quiz')

  if (!response.ok) {
    throw new Error(response.status === 409 ? '이 카드에서 다른 문제를 만들지 못했어요. 다시 시도해 주세요.' : `퀴즈를 만들지 못했어요 (${response.status}).`)
  }

  return parseKnowledgeQuiz(await response.json())
}

export function parseKnowledgeQuiz(quiz) {
  if (typeof quiz?.quizId !== 'string' || typeof quiz.question !== 'string' || !quiz.question.trim()
      || !Array.isArray(quiz.options) || quiz.options.length !== 4
      || quiz.options.some((option) => typeof option !== 'string' || !option.trim())) {
    throw new Error('퀴즈 문제나 보기를 받지 못했어요. 다시 만들어보세요.')
  }

  return { quizId: quiz.quizId, question: quiz.question, options: quiz.options }
}

export async function submitKnowledgeQuiz(quizId, selectedIndex) {
  const response = await fetch(`/api/quizzes/${quizId}/submissions`, {
    method: 'POST',
    headers: { ...await getCsrfHeaders(), 'Content-Type': 'application/json' },
    body: JSON.stringify({ selectedIndex }),
  })

  if (response.status === 410) throw new Error('퀴즈가 만료됐어요. 새 퀴즈를 만들어주세요.')
  if (response.status === 409) throw new Error('이미 답안을 제출했어요. 새 퀴즈를 만들어주세요.')
  if (!response.ok) throw new Error('채점하지 못했어요. 다시 시도해주세요.')

  const grade = await response.json()
  if (typeof grade?.correct !== 'boolean' || !Number.isInteger(grade.correctIndex)
      || grade.correctIndex < 0 || grade.correctIndex >= 4 || typeof grade.explanation !== 'string') {
    throw new Error('채점 결과를 확인하지 못했어요.')
  }
  return grade
}


export async function getExplanationFeedback(studyPath, explanation) {
  const response = await postStudy(studyPath, 'explanations', { explanation })

  if (!response.ok) {
    throw new Error(`피드백을 가져오지 못했어요(${response.status}).`)
  }

  const data = await response.json()
  return data.feedback
}

export async function generateKnowledge(topic, signal) {
  const response = await fetch('/api/knowledge/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ topic }),
    signal,
  })

  if (!response.ok) {
    throw new Error(`지식 카드를 생성하지 못했어요(${response.status}).`)
  }

  return response.json()
}

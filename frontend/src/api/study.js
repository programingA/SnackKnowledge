import { requestApi, isSuccessful } from './http'
import { getCsrfHeaders } from './account'

async function postStudy(studyPath, activity, body) {
  const csrf = studyPath.startsWith('/api/study/') ? await getCsrfHeaders() : {}
  return requestApi(studyPath + '/' + activity, {
    method: 'POST',
    headers: body === undefined ? csrf : { ...csrf, 'Content-Type': 'application/json' },
    data: body === undefined ? undefined : body,
  })
}

export async function reconnectGeneratedPreview({ category, title, summary, content }, signal) {
  const csrf = await getCsrfHeaders(signal)
  const response = await requestApi('/api/study/generated/previews', {
    method: 'POST',
    headers: { ...csrf, 'Content-Type': 'application/json' },
    data: { category, title, summary, content },
    signal,
  })
  if (!isSuccessful(response)) throw new Error('이 카드의 학습 기능에 연결하지 못했어요.')
  const result = response.data
  if (!result.studyId) throw new Error('이 카드의 학습 기능에 연결하지 못했어요.')
  return result.studyId
}

export async function getKnowledgeConversation(studyPath, signal) {
  const response = await requestApi(studyPath + '/questions', { signal })
  if (!isSuccessful(response)) throw new Error('대화를 불러오지 못했어요 (' + response.status + ')')
  return response.data
}

export async function askKnowledgeQuestion(studyPath, question) {
  const response = await postStudy(studyPath, 'questions', { question })

  if (!isSuccessful(response)) {
    const messages = {
      422: '이 카드와 관련된 학습 질문을 입력해주세요.',
      429: '이 카드의 질문 5회를 모두 사용했어요.',
      502: '검토를 통과한 답변을 받지 못했어요. 다시 질문해주세요.',
    }
    const error = new Error(messages[response.status] ?? `답변을 가져오지 못했어요(${response.status}).`)
    error.status = response.status
    throw error
  }

  const data = response.data
  return data.conversation
}

export async function generateKnowledgeQuiz(studyPath) {
  const response = await postStudy(studyPath, 'quiz')

  if (!isSuccessful(response)) {
    throw new Error(response.status === 409 ? '이 카드에서 다른 문제를 만들지 못했어요. 다시 시도해 주세요.' : `퀴즈를 만들지 못했어요 (${response.status}).`)
  }

  return parseKnowledgeQuiz(response.data)
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
  const response = await requestApi(`/api/quizzes/${quizId}/submissions`, {
    method: 'POST',
    headers: { ...await getCsrfHeaders(), 'Content-Type': 'application/json' },
    data: { selectedIndex },
  })

  if (response.status === 410) throw new Error('퀴즈가 만료됐어요. 새 퀴즈를 만들어주세요.')
  if (response.status === 409) throw new Error('이미 답안을 제출했어요. 새 퀴즈를 만들어주세요.')
  if (!isSuccessful(response)) throw new Error('채점하지 못했어요. 다시 시도해주세요.')

  const grade = response.data
  if (typeof grade?.correct !== 'boolean' || !Number.isInteger(grade.correctIndex)
      || grade.correctIndex < 0 || grade.correctIndex >= 4 || typeof grade.explanation !== 'string') {
    throw new Error('채점 결과를 확인하지 못했어요.')
  }
  return grade
}


export async function getExplanationFeedback(studyPath, explanation) {
  const response = await postStudy(studyPath, 'explanations', { explanation })
  if (response.status === 422) throw new Error('카드 내용을 내 말로 설명해주세요.')

  if (!isSuccessful(response)) {
    throw new Error(`피드백을 가져오지 못했어요(${response.status}).`)
  }

  const data = response.data
  return data.feedback
}

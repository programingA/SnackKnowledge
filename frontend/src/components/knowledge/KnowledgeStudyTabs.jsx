import { useRef, useState } from 'react'
import KnowledgeQuestionForm from './KnowledgeQuestionForm'
import KnowledgeReadingActions from './KnowledgeReadingActions'
import KnowledgeQuiz from './KnowledgeQuiz'
import KnowledgeExplanationForm from './KnowledgeExplanationForm'

const activities = [
  ['read', '지식 읽기'],
  ['ask', 'AI에게 질문'],
  ['quiz', '퀴즈로 복습'],
  ['explain', '직접 설명하기'],
]

export default function KnowledgeStudyTabs({ studyPath, summary, onComplete, error, readingFooter, children }) {
  const [activity, setActivity] = useState('read')
  const quizTab = useRef(null)

  function openQuiz() {
    setActivity('quiz')
    quizTab.current?.focus()
  }

  return (
    <>
      <div className="article-tabs" role="group" aria-label="학습 활동">
        {activities.map(([value, label]) => (
          <button type="button" key={value} ref={value === 'quiz' ? quizTab : undefined}
            className={activity === value ? 'active' : ''} aria-pressed={activity === value}
            onClick={() => setActivity(value)}>
            {label}
          </button>
        ))}
      </div>
      <div className="article-body">
        {error && <p role="alert">{error}</p>}
        <div hidden={activity !== 'read'}>
          {children}
          <KnowledgeReadingActions summary={summary} onQuiz={openQuiz} />
          {readingFooter}
        </div>
        <div hidden={activity !== 'ask'}>
          <KnowledgeQuestionForm studyPath={studyPath} onComplete={onComplete} active={activity === 'ask'} />
        </div>
        <div hidden={activity !== 'quiz'}>
          <KnowledgeQuiz studyPath={studyPath} onComplete={onComplete} />
        </div>
        <div hidden={activity !== 'explain'}>
          <KnowledgeExplanationForm studyPath={studyPath} onComplete={onComplete} />
        </div>
      </div>
    </>
  )
}

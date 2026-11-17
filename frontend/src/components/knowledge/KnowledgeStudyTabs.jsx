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

export default function KnowledgeStudyTabs({ studyPath, summary, onComplete, error, readingFooter, renderActivities, children }) {
  const [activity, setActivity] = useState('read')
  const quizTab = useRef(null)
  const panels = renderActivities ? renderActivities(setActivity) : studyPath ? {
    ask: <KnowledgeQuestionForm studyPath={studyPath} onComplete={onComplete} active={activity === 'ask'} />,
    quiz: <KnowledgeQuiz studyPath={studyPath} onComplete={onComplete} />,
    explain: <KnowledgeExplanationForm studyPath={studyPath} onComplete={onComplete} />,
  } : {}

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
            disabled={value !== 'read' && !panels[value]}
            onClick={() => setActivity(value)}>
            {label}
          </button>
        ))}
      </div>
      <div className="article-body">
        {error && <p role="alert">{error}</p>}
        <div hidden={activity !== 'read'}>
          {children}
          <KnowledgeReadingActions summary={summary} onQuiz={panels.quiz ? openQuiz : undefined} />
          {readingFooter}
        </div>
        {Object.entries(panels).map(([value, panel]) => (
          <div key={value} hidden={activity !== value}>{panel}</div>
        ))}
      </div>
    </>
  )
}

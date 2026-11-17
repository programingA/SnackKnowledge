import { useEffect, useId, useRef, useState } from 'react'
import Icon from '../ui/Icon'
import ArticleHeading from './ArticleHeading'
import KnowledgeStudyTabs from './KnowledgeStudyTabs'
import QuizOptions from './QuizOptions'
import './SampleArticlePage.css'

export default function SampleArticlePage({ article }) {
  const title = article.title.replaceAll('\n', ' ')

  return (
    <article className="article-page-card study-article" aria-label={title}>
      <ArticleHeading category={article.category} title={title} summary={article.summary} color={article.color} icon={article.icon}>
        <span className="reading-time">
          <Icon name="clock" size={14} />
          {article.time}분 읽기 · 샘플 콘텐츠
        </span>
      </ArticleHeading>
      <KnowledgeStudyTabs summary={article.takeaway} renderActivities={(setActivity) => ({
        ask: <SampleQuestion article={article} />,
        quiz: <SampleQuiz article={article} onExplain={() => setActivity('explain')} />,
        explain: <SampleExplanation article={article} />,
      })}>
        <div className="article-reading sample-reading-guide">
          <SampleActivityIntro eyebrow="A BITE OF KNOWLEDGE" title="익숙한 풍경에도 이유가 있어요."
            description="짧은 글을 읽으며 일상 속 궁금증을 하나씩 풀어보세요." />
        </div>
        {article.id === 'sky' && (
          <img className="knowledge-illustration" src={`${import.meta.env.BASE_URL}sample-sky.jpg`}
            alt="초록 언덕 위로 흰 구름이 떠 있는 파란 하늘" />
        )}
        <div className="article-reading">
          <p className="article-intro">{article.intro}</p>
          {article.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
        </div>
      </KnowledgeStudyTabs>
    </article>
  )
}

function SampleActivityIntro({ eyebrow, title, description, notice }) {
  return (
    <div className="sample-activity-intro">
      <span className="eyebrow">{eyebrow}</span>
      <h3>{title}</h3>
      <p className="muted">{description}</p>
      {notice && <div className="demo-notice">{notice}</div>}
    </div>
  )
}

function SampleQuestion({ article }) {
  const inputId = useId()
  const [question, setQuestion] = useState('')
  const [submitted, setSubmitted] = useState('')

  return (
    <section className="knowledge-chat" aria-label="AI에게 질문하기">
      <div className="knowledge-chat-heading">
        <SampleActivityIntro eyebrow="CURIOSITY GOES ON" title="궁금증은 여기서 끝나지 않아요."
          description="읽은 내용에서 한 걸음 더 나아가 보세요."
          notice="샘플에서 입력한 질문은 전송하지 않으며, 준비된 예시 답변을 보여줍니다." />
      </div>
      <div className="knowledge-chat-log" role="log" aria-label="예시 대화" tabIndex={0}>
        {submitted ? (
          <>
            <div className="knowledge-chat-message knowledge-chat-user"><strong>나</strong><p>{submitted}</p></div>
            <div className="knowledge-chat-message knowledge-chat-ai">
              <strong>준비된 예시 답변</strong>
              <p>{article.answer}</p>
            </div>
          </>
        ) : <p className="knowledge-chat-empty">아래에서 예시 질문을 선택하거나 궁금한 점을 적어보세요.</p>}
      </div>
      <form className="knowledge-chat-form" onSubmit={(event) => {
        event.preventDefault()
        if (question.trim()) setSubmitted(question.trim())
      }}>
        <button className="suggestion" type="button" onClick={() => {
          setQuestion(article.followup)
          setSubmitted('')
        }}>
          <Icon name="sparkle" size={16} />
          {article.followup}
        </button>
        <label htmlFor={inputId}>궁금한 점</label>
        <div className="input-action">
          <input id={inputId} value={question} maxLength={300} placeholder="궁금한 점을 자유롭게 적어주세요"
            onChange={(event) => setQuestion(event.target.value)} />
          <button type="submit" className="primary-button" disabled={!question.trim()}>예시 답변 보기</button>
        </div>
      </form>
    </section>
  )
}

function SampleQuiz({ article, onExplain }) {
  const questionId = useId()
  const resultHeading = useRef(null)
  const [choice, setChoice] = useState(null)
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    if (submitted) resultHeading.current?.focus()
  }, [submitted])

  return (
    <section className="knowledge-quiz-panel" aria-label="퀴즈로 복습하기">
      <div className="knowledge-quiz-header">
        <SampleActivityIntro eyebrow="A LITTLE CHECK" title="방금 만난 지식, 내 것이 됐을까요?"
          description="미리 준비한 객관식 퀴즈로 가볍게 확인해요." />
      </div>
      <div className="quiz-question">
        <span>QUESTION 01</span>
        <h4 id={questionId}>{article.question}</h4>
      </div>
      <QuizOptions questionId={questionId} options={article.options} selectedIndex={choice}
        correctIndex={submitted ? article.correct : undefined} onSelect={setChoice} />
      {submitted ? (
        <div className="response quiz-result" role="status">
          <h4 className="quiz-result-title" ref={resultHeading} tabIndex={-1}>
            {choice === article.correct ? '정답이에요' : '오답이에요'}
          </h4>
          <p>정답: {article.options[article.correct]}</p>
          <p>{article.explanation}</p>
          <button className="text-button" type="button" onClick={onExplain}>이번엔 내 말로 설명해보기</button>
        </div>
      ) : (
        <div className="knowledge-quiz-footer">
          <button type="button" className="primary-button quiz-submit-button" disabled={choice === null}
            onClick={() => setSubmitted(true)}>정답 확인하기</button>
        </div>
      )}
    </section>
  )
}

function SampleExplanation({ article }) {
  const inputId = useId()
  const [explanation, setExplanation] = useState('')
  const [feedback, setFeedback] = useState(false)
  const length = Array.from(explanation.trim()).length
  const keywordMatch = article.keywords.some((word) => explanation.includes(word))

  return (
    <form className="knowledge-explanation" onSubmit={(event) => {
      event.preventDefault()
      if (length >= 20) setFeedback(true)
    }}>
      <SampleActivityIntro eyebrow="MAKE IT YOURS" title="내 말로 설명하면, 진짜 내 지식."
        description="친구에게 이야기하듯 배운 내용을 설명해보세요."
        notice="샘플 피드백은 입력 길이와 키워드만 확인하며 정확성을 평가하지 않습니다." />
      <label htmlFor={inputId}>나는 이렇게 이해했어요</label>
      <textarea id={inputId} rows={5} value={explanation} maxLength={1500} aria-describedby={`${inputId}-count`}
        placeholder="핵심 개념과 그 이유를 20자 이상 적어주세요."
        onChange={(event) => {
          setExplanation(event.target.value)
          setFeedback(false)
        }} />
      <div className="form-bottom">
        <small id={`${inputId}-count`}>{length.toLocaleString('ko-KR')} / 1,500자</small>
        <button type="submit" className="primary-button" disabled={length < 20}>체험 피드백 보기</button>
      </div>
      {feedback && (
        <div className="response" role="status">
          <strong>설명 연습을 마쳤어요!</strong>
          <p>{keywordMatch
            ? '관련 키워드가 포함되어 있어요. 키워드를 사용했다는 것만으로 내용이 정확하다고 판단할 수는 없어요.'
            : '핵심 개념을 자신의 설명과 연결해보세요. 표현이 달라도 괜찮아요.'}</p>
          <p><b>원문과 비교해볼 핵심:</b> {article.takeaway}</p>
        </div>
      )}
    </form>
  )
}

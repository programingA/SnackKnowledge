import { useState } from 'react'
import Icon from '../ui/Icon'
import Modal from '../ui/Modal'

export default function SampleArticleModal({ article, onClose }) {
  const [tab, setTab] = useState('read')
  const [question, setQuestion] = useState('')
  const [asked, setAsked] = useState(false)
  const [choice, setChoice] = useState(null)
  const [submitted, setSubmitted] = useState(false)
  const [explanation, setExplanation] = useState('')
  const [feedback, setFeedback] = useState(false)
  const tabs = [
    ['read', '지식 읽기'],
    ['ask', 'AI에게 질문'],
    ['quiz', '퀴즈 풀기'],
    ['explain', '직접 설명하기'],
  ]
  const keywordMatch = article.keywords.some((word) =>
    explanation.includes(word),
  )
  return (
    <Modal
      label={article.title.replace('\n', ' ')}
      onClose={onClose}
      className="article-modal"
    >
      <div className={`article-heading tint-${article.color}`}>
        <span className={`category-label text-${article.color}`}>
          <Icon name={article.icon} size={17} />
          {article.category} 한 입
        </span>
        <h2>{article.title.replace('\n', ' ')}</h2>
        <p>{article.summary}</p>
        <span className="reading-time">
          <Icon name="clock" size={14} />
          {article.time}분 읽기 · 샘플 콘텐츠
        </span>
      </div>
      <div className="article-tabs" aria-label="학습 활동">
        {tabs.map(([id, label]) => (
          <button
            key={id}
            className={tab === id ? 'active' : ''}
            aria-pressed={tab === id}
            onClick={() => setTab(id)}
          >
            {label}
          </button>
        ))}
      </div>
      <div className="article-body" key={tab}>
        {tab === 'read' && (
          <>
            <p className="article-intro">{article.intro}</p>
            {article.paragraphs.map((p) => (
              <p key={p}>{p}</p>
            ))}
            <div className="takeaway">
              <Icon name="sparkle" />
              <div>
                <strong>이것만 기억해요</strong>
                <p>{article.takeaway}</p>
              </div>
            </div>
            <button className="primary-button" onClick={() => setTab('quiz')}>
              잘 이해했는지 확인해볼까요?
              <Icon name="arrow" size={17} />
            </button>
          </>
        )}
        {tab === 'ask' && (
          <>
            <span className="eyebrow">CURIOSITY GOES ON</span>
            <h3>궁금증은 여기서 끝나지 않아요.</h3>
            <p className="muted">읽은 내용에서 한 걸음 더 나아가 보세요.</p>
            <div className="demo-notice">
              프론트 체험용입니다. 질문을 전송하지 않으며, 준비된 예시 답변을
              보여줍니다.
            </div>
            <button
              className="suggestion"
              onClick={() => {
                setQuestion(article.followup)
                setAsked(false)
              }}
            >
              <Icon name="sparkle" size={16} />
              {article.followup}
            </button>
            <form
              onSubmit={(e) => {
                e.preventDefault()
                if (question.trim()) setAsked(true)
              }}
            >
              <label htmlFor="question">궁금한 점</label>
              <div className="input-action">
                <input
                  id="question"
                  value={question}
                  maxLength={300}
                  onChange={(e) => {
                    setQuestion(e.target.value)
                    setAsked(false)
                  }}
                  placeholder="궁금한 점을 자유롭게 적어주세요"
                  required
                />
                <button
                  className="primary-button"
                  disabled={!question.trim()}
                  type="submit"
                >
                  <Icon name="arrow" size={19} />
                  <span className="sr-only">예시 답변 보기</span>
                </button>
              </div>
            </form>
            {asked && (
              <div className="response" role="status">
                <strong>
                  <Icon name="sparkle" size={17} />
                  준비된 예시 답변
                </strong>
                <p>{article.answer}</p>
                <small>
                  입력한 질문에 대한 실제 AI 응답은 API 연동 후 제공됩니다.
                </small>
              </div>
            )}
          </>
        )}
        {tab === 'quiz' && (
          <>
            <span className="eyebrow">A LITTLE CHECK</span>
            <h3>방금 만난 지식, 내 것이 됐을까요?</h3>
            <p className="muted">미리 준비한 객관식 퀴즈로 가볍게 확인해요.</p>
            <div className="quiz-question">
              <span>QUESTION 01</span>
              <h4>{article.question}</h4>
            </div>
            <fieldset className="quiz-options">
              <legend className="sr-only">정답 선택</legend>
              {article.options.map((option, index) => (
                <label
                  key={option}
                  className={`option ${choice === index ? 'chosen' : ''} ${submitted && index === article.correct ? 'correct' : ''} ${submitted && choice === index && index !== article.correct ? 'wrong' : ''}`}
                >
                  <input
                    type="radio"
                    name="quiz"
                    value={index}
                    checked={choice === index}
                    disabled={submitted}
                    onChange={() => setChoice(index)}
                  />
                  <span className="option-number">{index + 1}</span>
                  {option}
                  {submitted && index === article.correct && (
                    <Icon name="check" size={18} />
                  )}
                </label>
              ))}
            </fieldset>
            {!submitted ? (
              <button
                className="primary-button full-width"
                disabled={choice === null}
                onClick={() => setSubmitted(true)}
              >
                정답 확인하기
                <Icon name="arrow" size={17} />
              </button>
            ) : (
              <div className="response" role="status">
                <strong>
                  {choice === article.correct
                    ? '정답이에요! 지식 한 입, 잘 소화했네요.'
                    : '괜찮아요. 알아가는 과정이니까요.'}
                </strong>
                <p>{article.explanation}</p>
                <button
                  className="text-button"
                  onClick={() => setTab('explain')}
                >
                  이번엔 내 말로 설명해보기 <Icon name="arrow" size={16} />
                </button>
              </div>
            )}
          </>
        )}
        {tab === 'explain' && (
          <>
            <span className="eyebrow">MAKE IT YOURS</span>
            <h3>내 말로 설명하면, 진짜 내 지식.</h3>
            <p className="muted">
              친구에게 이야기하듯 배운 내용을 설명해보세요.
            </p>
            <div className="demo-notice">
              AI 연동 전 체험입니다. 입력 길이와 키워드만 확인하며 정확성을
              평가하지 않습니다.
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault()
                if (explanation.trim().length >= 20) setFeedback(true)
              }}
            >
              <label htmlFor="explanation">나는 이렇게 이해했어요</label>
              <textarea
                id="explanation"
                rows="5"
                value={explanation}
                maxLength={1500}
                onChange={(e) => {
                  setExplanation(e.target.value)
                  setFeedback(false)
                }}
                placeholder="핵심 개념과 그 이유를 20자 이상 적어주세요."
              />
              <div className="form-bottom">
                <small>{explanation.trim().length} / 1,500자</small>
                <button
                  type="submit"
                  className="primary-button"
                  disabled={explanation.trim().length < 20}
                >
                  <Icon name="sparkle" size={16} />
                  체험 피드백 보기
                </button>
              </div>
            </form>
            {feedback && (
              <div className="response" role="status">
                <strong>설명 연습을 마쳤어요!</strong>
                <p>
                  {keywordMatch
                    ? '관련 키워드가 포함되어 있어요. 키워드를 사용했다는 것만으로 내용이 정확하다고 판단할 수는 없어요.'
                    : '핵심 개념을 자신의 설명과 연결해보세요. 표현이 달라도 괜찮아요.'}
                </p>
                <p>
                  <b>원문과 비교해볼 핵심:</b> {article.takeaway}
                </p>
                <small>
                  실제 AI의 개념 이해도 평가·수정 제안은 추후 연동합니다.
                </small>
              </div>
            )}
          </>
        )}
      </div>
    </Modal>
  )
}

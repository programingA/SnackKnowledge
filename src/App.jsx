import { useEffect, useRef, useState } from 'react'
import { articles, categories } from './data'
import './App.css'

function Icon({ name, size = 20, ...props }) {
  const paths = {
    arrow: <><path d="M5 12h14M13 6l6 6-6 6" /></>,
    search: <><circle cx="10.5" cy="10.5" r="6.5" /><path d="m16 16 4 4" /></>,
    sun: <><circle cx="12" cy="12" r="4" /><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5" /></>,
    bread: <><path d="M5 11c-5-1-3-8 3-7 2-2 6-2 8 0 6-1 8 6 3 7v9H5zM9 12v4m6-4v4" /></>,
    wifi: <><path d="M2 8a16 16 0 0 1 20 0M5 12a11 11 0 0 1 14 0m-11 4a6 6 0 0 1 8 0" /><circle cx="12" cy="20" r="1" /></>,
    brain: <><path d="M12 6c-1-5-8-3-7 2-4 1-4 7 0 8-1 5 6 7 7 2 1 5 8 3 7-2 4-1 4-7 0-8 1-5-6-7-7-2v12M8 8l1 3m6 3 2 2M5 16l3-1m8-7-1 2" /></>,
    leaf: <><path d="M20 3C8 1 2 8 5 15s17 4 15-12ZM5 20 16 8M8 14l5 1" /></>,
    moon: <path d="M20 15A9 9 0 0 1 9 3a9 9 0 1 0 11 12Z" />,
    sparkle: <><path d="m12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5L12 3Z" /><path d="M20 2v4m-2-2h4" /></>,
    close: <path d="m6 6 12 12M6 18 18 6" />,
    clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
    shuffle: <><path d="M3 6h3c4 0 8 12 12 12h3m-4-4 4 4-4 4M3 18h3c1.5 0 3-2 4-4m4-4c1-2 2.5-4 4-4h3m-4-4 4 4-4 4" /></>,
    check: <path d="m5 12 4 4L19 6" />,
    book: <><path d="M12 5C8 2 4 3 2 4v15c4-2 7-1 10 1 3-2 6-3 10-1V4c-3-1-7-2-10 1v15" /></>,
  }
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>{paths[name] || paths.sparkle}</svg>
}

function Modal({ children, onClose, label, className = '' }) {
  const ref = useRef(null)
  useEffect(() => {
    const dialog = ref.current
    const previous = document.activeElement
    dialog.showModal()
    const overflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      dialog.close()
      document.body.style.overflow = overflow
      previous?.focus()
    }
  }, [])
  return <dialog ref={ref} className={`modal ${className}`} aria-label={label} onCancel={onClose} onClick={e => { if (e.target === e.currentTarget) onClose() }}>
    <button className="close-button" aria-label="창 닫기" onClick={onClose}><Icon name="close" /></button>{children}
  </dialog>
}

function ArticleModal({ article, onClose }) {
  const [tab, setTab] = useState('read')
  const [question, setQuestion] = useState('')
  const [asked, setAsked] = useState(false)
  const [choice, setChoice] = useState(null)
  const [submitted, setSubmitted] = useState(false)
  const [explanation, setExplanation] = useState('')
  const [feedback, setFeedback] = useState(false)
  const tabs = [['read', '지식 읽기'], ['ask', 'AI에게 질문'], ['quiz', '퀴즈 풀기'], ['explain', '직접 설명하기']]
  const keywordMatch = article.keywords.some(word => explanation.includes(word))
  return <Modal label={article.title.replace('\n', ' ')} onClose={onClose} className="article-modal">
    <div className={`article-heading tint-${article.color}`}>
      <span className={`category-label text-${article.color}`}><Icon name={article.icon} size={17} />{article.category} 한 입</span>
      <h2>{article.title.replace('\n', ' ')}</h2><p>{article.summary}</p>
      <span className="reading-time"><Icon name="clock" size={14} />{article.time}분 읽기 · 샘플 콘텐츠</span>
    </div>
    <div className="article-tabs" aria-label="학습 활동">{tabs.map(([id, label]) => <button key={id} className={tab === id ? 'active' : ''} aria-pressed={tab === id} onClick={() => setTab(id)}>{label}</button>)}</div>
    <div className="article-body" key={tab}>
      {tab === 'read' && <><p className="article-intro">{article.intro}</p>{article.paragraphs.map(p => <p key={p}>{p}</p>)}<div className="takeaway"><Icon name="sparkle" /><div><strong>이것만 기억해요</strong><p>{article.takeaway}</p></div></div><button className="primary-button" onClick={() => setTab('quiz')}>잘 이해했는지 확인해볼까요?<Icon name="arrow" size={17} /></button></>}
      {tab === 'ask' && <><span className="eyebrow">CURIOSITY GOES ON</span><h3>궁금증은 여기서 끝나지 않아요.</h3><p className="muted">읽은 내용에서 한 걸음 더 나아가 보세요.</p><div className="demo-notice">프론트 체험용입니다. 질문을 전송하지 않으며, 준비된 예시 답변을 보여줍니다.</div><button className="suggestion" onClick={() => { setQuestion(article.followup); setAsked(false) }}><Icon name="sparkle" size={16} />{article.followup}</button><form onSubmit={e => { e.preventDefault(); if (question.trim()) setAsked(true) }}><label htmlFor="question">궁금한 점</label><div className="input-action"><input id="question" value={question} maxLength={300} onChange={e => { setQuestion(e.target.value); setAsked(false) }} placeholder="궁금한 점을 자유롭게 적어주세요" required /><button className="primary-button" disabled={!question.trim()} type="submit"><Icon name="arrow" size={19} /><span className="sr-only">예시 답변 보기</span></button></div></form>{asked && <div className="response" role="status"><strong><Icon name="sparkle" size={17} />준비된 예시 답변</strong><p>{article.answer}</p><small>입력한 질문에 대한 실제 AI 응답은 API 연동 후 제공됩니다.</small></div>}</>}
      {tab === 'quiz' && <><span className="eyebrow">A LITTLE CHECK</span><h3>방금 만난 지식, 내 것이 됐을까요?</h3><p className="muted">미리 준비한 객관식 퀴즈로 가볍게 확인해요.</p><div className="quiz-question"><span>QUESTION 01</span><h4>{article.question}</h4></div><fieldset className="quiz-options"><legend className="sr-only">정답 선택</legend>{article.options.map((option, index) => <label key={option} className={`option ${choice === index ? 'chosen' : ''} ${submitted && index === article.correct ? 'correct' : ''} ${submitted && choice === index && index !== article.correct ? 'wrong' : ''}`}><input type="radio" name="quiz" value={index} checked={choice === index} disabled={submitted} onChange={() => setChoice(index)} /><span className="option-number">{index + 1}</span>{option}{submitted && index === article.correct && <Icon name="check" size={18} />}</label>)}</fieldset>{!submitted ? <button className="primary-button full-width" disabled={choice === null} onClick={() => setSubmitted(true)}>정답 확인하기<Icon name="arrow" size={17} /></button> : <div className="response" role="status"><strong>{choice === article.correct ? '정답이에요! 지식 한 입, 잘 소화했네요.' : '괜찮아요. 알아가는 과정이니까요.'}</strong><p>{article.explanation}</p><button className="text-button" onClick={() => setTab('explain')}>이번엔 내 말로 설명해보기 <Icon name="arrow" size={16} /></button></div>}</>}
      {tab === 'explain' && <><span className="eyebrow">MAKE IT YOURS</span><h3>내 말로 설명하면, 진짜 내 지식.</h3><p className="muted">친구에게 이야기하듯 배운 내용을 설명해보세요.</p><div className="demo-notice">AI 연동 전 체험입니다. 입력 길이와 키워드만 확인하며 정확성을 평가하지 않습니다.</div><form onSubmit={e => { e.preventDefault(); if (explanation.trim().length >= 20) setFeedback(true) }}><label htmlFor="explanation">나는 이렇게 이해했어요</label><textarea id="explanation" rows="5" value={explanation} maxLength={1500} onChange={e => { setExplanation(e.target.value); setFeedback(false) }} placeholder="핵심 개념과 그 이유를 20자 이상 적어주세요." /><div className="form-bottom"><small>{explanation.trim().length} / 1,500자</small><button type="submit" className="primary-button" disabled={explanation.trim().length < 20}><Icon name="sparkle" size={16} />체험 피드백 보기</button></div></form>{feedback && <div className="response" role="status"><strong>설명 연습을 마쳤어요!</strong><p>{keywordMatch ? '관련 키워드가 포함되어 있어요. 키워드를 사용했다는 것만으로 내용이 정확하다고 판단할 수는 없어요.' : '핵심 개념을 자신의 설명과 연결해보세요. 표현이 달라도 괜찮아요.'}</p><p><b>원문과 비교해볼 핵심:</b> {article.takeaway}</p><small>실제 AI의 개념 이해도 평가·수정 제안은 추후 연동합니다.</small></div>}</>}
    </div>
  </Modal>
}

function GenerateModal({ onClose, onOpen }) {
  const [topic, setTopic] = useState('')
  const [result, setResult] = useState(false)
  return <Modal label="새로운 지식 만들기" onClose={onClose} className="generate-modal"><span className="large-icon"><Icon name="sparkle" size={29} /></span><span className="eyebrow">FOLLOW YOUR CURIOSITY</span><h2>오늘은 무엇이 궁금한가요?</h2><p className="muted">작은 호기심 하나가 새로운 발견의 시작이에요.</p><div className="demo-notice">현재는 샘플 체험입니다. 입력한 주제로 실제 콘텐츠를 생성하지 않습니다.</div><form onSubmit={e => { e.preventDefault(); if (topic.trim()) setResult(true) }}><label htmlFor="topic">알고 싶은 주제</label><input id="topic" value={topic} maxLength={100} onChange={e => { setTopic(e.target.value); setResult(false) }} placeholder="예: 하늘은 왜 파란색일까?" required /><div className="topic-suggestions">{['하늘의 색', '와이파이의 원리', '달빛의 비밀'].map(t => <button type="button" key={t} onClick={() => { setTopic(t); setResult(false) }}>{t} +</button>)}</div><button type="submit" className="primary-button full-width" disabled={!topic.trim()}><Icon name="sparkle" size={17} />샘플 결과 체험하기<Icon name="arrow" size={17} /></button></form>{result && <div className="response" role="status"><strong>이런 지식이 만들어질 거예요</strong><p>입력한 주제와 별개로, 준비된 ‘하늘은 왜 파란색일까?’ 샘플을 보여드려요.</p><button className="text-button" onClick={() => onOpen(articles[0])}>샘플 지식 읽기<Icon name="arrow" size={16} /></button></div>}</Modal>
}

function App() {
  const [category, setCategory] = useState('전체')
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState(null)
  const [modal, setModal] = useState(null)
  const visible = articles.filter(a => (category === '전체' || a.category === category) && `${a.title.replace('\n', ' ')} ${a.summary} ${a.category}`.includes(search.trim()))
  const openArticle = article => { setModal(null); setSelected(article) }
  const randomArticle = () => openArticle(articles[Math.floor(Math.random() * articles.length)])
  const scrollToFeed = () => document.getElementById('knowledge-feed').scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' })
  return <>
    <a className="skip-link" href="#knowledge-feed">지식 목록으로 바로가기</a>
    <header className="site-header"><div className="header-inner"><a className="brand" href="#" aria-label="한입지식 홈"><span className="brand-symbol"><Icon name="book" size={23} /></span><span>한입지식<span className="brand-dot">.</span></span></a><nav aria-label="주 메뉴"><button className="nav-active" onClick={scrollToFeed}>지식 둘러보기</button><button onClick={() => setModal('about')}>한입지식 소개</button></nav><span className="preview-badge"><span />프론트 미리보기</span></div></header>
    <main className="page-shell">
      <section className="hero" aria-labelledby="hero-title"><div className="hero-copy"><div className="hero-eyebrow"><span className="little-line" />A LITTLE KNOWLEDGE, EVERY DAY</div><h1 id="hero-title">세상의 모든 호기심,<br /><span>한 입</span>이면 충분해요<span className="period">.</span></h1><p>몰랐던 세상이 가까워지는 시간.<br />짧게 읽고, 깊게 궁금해하고, 나만의 지식으로 만들어봐요.</p><div className="hero-actions"><button className="primary-button" onClick={scrollToFeed}>오늘의 지식 만나기<Icon name="arrow" size={18} /></button><button className="random-button" onClick={randomArticle}><Icon name="shuffle" size={18} />우연한 발견</button></div><div className="hero-footnote"><span className="small-spark">✳</span>하루 2분, 호기심을 채우는 작은 습관</div></div>
      <button className="featured-card" onClick={() => openArticle(articles[0])} aria-label="오늘의 한입: 하늘은 왜 파란색일까? 읽기"><div className="featured-top"><span><span className="live-dot" />오늘의 한입</span><span>NO. 001</span></div><div className="sun-art" aria-hidden="true"><div className="orbit orbit-one" /><div className="orbit orbit-two" /><div className="sun-core">✳</div><span className="art-dot dot-one" /><span className="art-dot dot-two" /><span className="art-star">✧</span><span className="art-label">a little wonder</span></div><div className="featured-bottom"><div><span>과학 · 2분 읽기</span><h2>하늘은 왜<br />파란색일까?</h2></div><span className="round-arrow"><Icon name="arrow" size={24} /></span></div></button></section>
      <section className="knowledge-section" id="knowledge-feed" aria-labelledby="feed-title"><div className="section-top"><div><span className="eyebrow">YOUR DAILY DISCOVERY</span><h2 id="feed-title">어떤 지식을 맛볼까요?<span className="heading-spark">✳</span></h2><p>마음이 가는 카드를 골라, 새로운 이야기를 만나보세요.</p></div><label className="search-box"><Icon name="search" size={19} /><span className="sr-only">지식 검색</span><input type="search" placeholder="어떤 지식이 궁금하세요?" value={search} onChange={e => setSearch(e.target.value)} /></label></div><div className="filter-bar"><div className="category-tabs" aria-label="카테고리 필터">{categories.map(c => <button aria-pressed={category === c} onClick={() => setCategory(c)} className={category === c ? 'selected' : ''} key={c}>{c === '전체' && <Icon name="sparkle" size={15} />}{c}</button>)}</div><span className="result-count" role="status">총 <b>{visible.length}</b>개의 지식</span></div>
      <div className="card-grid" key={`${category}-${search}`}>{visible.map((article, index) => <button className="knowledge-card" key={article.id} style={{ '--index': index }} onClick={() => openArticle(article)}><div className="card-top"><span className={`topic-icon tint-${article.color} text-${article.color}`}><Icon name={article.icon} size={23} /></span><span className={`category-label text-${article.color}`}>{article.category}</span><span className="card-number">0{articles.indexOf(article) + 1}</span></div><span className="card-label">{article.label}</span><h3>{article.title}</h3><p>{article.summary}</p><div className="card-bottom"><span><Icon name="clock" size={14} />{article.time}분이면 충분해요</span><span className="card-link">한 입 읽기<Icon name="arrow" size={16} /></span></div></button>)}</div>
      {visible.length === 0 && <div className="empty-state"><Icon name="search" size={32} /><h3>아직 준비되지 않은 호기심이에요.</h3><p>다른 단어를 검색하거나 전체 지식을 둘러보세요.</p><button className="text-button" onClick={() => { setSearch(''); setCategory('전체') }}>전체 지식 보기<Icon name="arrow" size={16} /></button></div>}</section>
      <section className="curiosity-banner"><div className="banner-mark" aria-hidden="true">✳</div><div><span className="eyebrow">LET CURIOSITY LEAD</span><h2>찾는 지식이 없다면, 호기심을 꺼내보세요.</h2><p>궁금한 주제를 입력하고 나만의 지식을 만나는 경험.</p></div><button className="primary-button" onClick={() => setModal('generate')}><Icon name="sparkle" size={17} />새 지식 체험하기<Icon name="arrow" size={17} /></button></section>
      <div className="closing-note">어제보다 조금 더 넓어진 세상.<span>오늘도 한 입, 잘 먹었습니다.</span></div>
    </main><footer className="site-footer"><div className="footer-inner"><span className="footer-brand">한입지식.</span><span>작은 호기심이 쌓여, 나만의 세상이 됩니다.</span><a href="https://github.com/programingA/SnackKnowledge" target="_blank" rel="noreferrer">GitHub ↗</a></div></footer>
    {selected && <ArticleModal key={selected.id} article={selected} onClose={() => setSelected(null)} />}
    {modal === 'generate' && <GenerateModal onClose={() => setModal(null)} onOpen={openArticle} />}
    {modal === 'about' && <Modal label="한입지식 소개" onClose={() => setModal(null)} className="generate-modal"><span className="large-icon"><Icon name="book" size={28} /></span><span className="eyebrow">A BITE OF KNOWLEDGE</span><h2>발견하면서 배우는 즐거움.</h2><p className="about-copy">한입지식은 흥미로운 지식을 짧게 읽고, 질문하고, 퀴즈를 풀고, 자신의 말로 설명하며 이해를 넓히는 서비스예요.</p><div className="takeaway"><Icon name="sparkle" /><div><strong>지금은 프론트 미리보기예요</strong><p>6개의 샘플 지식과 퀴즈를 체험할 수 있어요. 로그인·영구 저장·실제 AI 요청은 제공하지 않으며, 질문과 설명은 외부로 전송하지 않아요.</p></div></div><button className="primary-button full-width" onClick={() => { setModal(null); scrollToFeed() }}>첫 번째 호기심 만나기<Icon name="arrow" size={17} /></button></Modal>}
  </>
}

export default App

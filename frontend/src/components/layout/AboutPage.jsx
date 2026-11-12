import Icon from '../ui/Icon'

export default function AboutPage({ onGenerate }) {
  return (
    <main className="page-shell about-page" id="about-page" tabIndex={-1}>
      <header className="about-intro">
        <h1>한입지식 소개</h1>
        <p>일상에서 생긴 궁금증을 짧게 읽고, 질문과 복습을 통해 이해를 넓히는 학습 서비스예요.</p>
      </header>

      <div className="about-content">
        <section className="about-section" aria-labelledby="about-discover-title">
          <h2 id="about-discover-title">궁금한 주제에서 시작해요</h2>
          <p>하늘의 색부터 와이파이의 원리까지, 과학·기술·일상 속 지식을 카드로 읽을 수 있어요. 목록에 없는 주제는 AI로 새 카드를 만들어 살펴볼 수 있어요.</p>
          <a className="about-sample-link" href="#/sample/sky">
            샘플 읽기 · 하늘은 왜 파란색일까? <Icon name="arrow" size={17} />
          </a>
        </section>

        <section className="about-section" aria-labelledby="about-learning-title">
          <h2 id="about-learning-title">한 카드로 이렇게 배워요</h2>
          <ol className="about-steps">
            <li><h3>읽기</h3><p>짧은 본문과 핵심 한 줄로 주제를 파악해요.</p></li>
            <li><h3>질문하기</h3><p>카드 내용에서 궁금한 점을 AI에게 물어봐요.</p></li>
            <li><h3>퀴즈 풀기</h3><p>문제를 풀고 정답과 해설로 이해를 확인해요.</p></li>
            <li><h3>직접 설명하기</h3><p>내 말로 정리하고 피드백을 받아요.</p></li>
          </ol>
        </section>

        <section className="about-section" aria-labelledby="about-library-title">
          <h2 id="about-library-title">읽은 지식은 마이페이지에서 다시 봐요</h2>
          <p>로그인하면 북마크와 내가 만든 카드를 모아볼 수 있어요. 학습 기록과 오답을 확인하고, 관심 분야를 설정해 홈 추천에 반영할 수 있어요.</p>
        </section>

        <p className="about-ai-note">
          <Icon name="info" size={16} />
          <span>AI 기능에 입력한 주제·질문·설명은 응답 생성을 위해 AI 서비스로 전송돼요.</span>
        </p>

        <div className="about-actions">
          <a className="primary-button about-browse" href="#knowledge-feed">
            지식 둘러보기 <Icon name="arrow" size={17} />
          </a>
          <button type="button" className="primary-button about-generate" onClick={onGenerate}>
            새 지식 만들기
          </button>
        </div>
      </div>
    </main>
  )
}

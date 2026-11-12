import { articles } from '../../data/sampleKnowledge'
import Icon from '../ui/Icon'

const sample = articles.find((article) => article.id === 'sky')

export default function AboutPage({ onGenerate }) {
  return (
    <main className="page-shell about-page" id="about-page" tabIndex={-1}>
      <header className="about-hero">
        <div className="about-intro">
          <h1>일상의 궁금증을<br />한입씩 배워요</h1>
          <p>하늘의 색부터 와이파이의 원리까지. 과학·기술·일상 속 궁금증을 짧은 지식 카드로 만나보세요. 원하는 주제가 있다면 AI로 새 카드를 만들 수 있어요.</p>
          <div className="about-actions">
            <a className="primary-button about-browse" href="#knowledge-feed">
              지식 둘러보기 <Icon name="arrow" size={17} />
            </a>
            <button type="button" className="primary-button about-generate" onClick={onGenerate}>
              새 지식 만들기
            </button>
          </div>
        </div>

        <a className="about-example" href={'#/sample/' + sample.id}>
          <div className="about-example-art">
            <Icon name={sample.icon} size={52} />
          </div>
          <div className="about-example-copy">
            <p>샘플 카드 · {sample.category} · {sample.time}분 읽기</p>
            <h2>{sample.title.replace('\n', ' ')}</h2>
            <span>카드 체험하기 <Icon name="arrow" size={17} /></span>
          </div>
        </a>
      </header>

      <section className="about-learning" aria-labelledby="about-learning-title">
        <h2 id="about-learning-title">한 카드로 이렇게 배워요</h2>
        <ol className="about-steps">
          <li><h3>읽기</h3><p>짧은 본문과 핵심 한 줄로 주제를 파악해요.</p></li>
          <li><h3>질문하기</h3><p>카드 내용에서 궁금한 점을 AI에게 물어봐요.</p></li>
          <li><h3>퀴즈 풀기</h3><p>문제를 풀고 정답과 해설로 이해를 확인해요.</p></li>
          <li><h3>직접 설명하기</h3><p>내 말로 정리하고 피드백을 받아요.</p></li>
        </ol>
      </section>

      <section className="about-library" aria-labelledby="about-library-title">
        <Icon name="bookmark" size={25} />
        <div>
          <h2 id="about-library-title">다시 보고 싶은 지식은 마이페이지에</h2>
          <p>로그인하면 북마크와 내가 만든 카드를 모아볼 수 있어요. 학습 기록과 오답을 확인하고, 관심 분야를 설정해 홈 추천에 반영할 수 있어요.</p>
        </div>
      </section>

      <p className="about-ai-note">
        <Icon name="info" size={16} />
        <span>AI 기능에 입력한 주제·질문·설명은 응답 생성을 위해 AI 서비스로 전송돼요.</span>
      </p>
    </main>
  )
}

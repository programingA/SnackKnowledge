import Icon from '../ui/Icon'
import Modal from '../ui/Modal'

export default function AboutModal({ onClose, onBrowse, onGenerate }) {
  return (
    <Modal label="한입지식 소개" onClose={onClose} className="about-modal">
      <div className="about-intro">
        <span className="about-icon" aria-hidden="true"><Icon name="book" size={24} /></span>
        <h2>한입지식 소개</h2>
        <p>과학, 기술, 일상 속 궁금증을 짧은 카드로 읽고, 질문과 퀴즈로 이해를 넓히는 학습 서비스예요.</p>
      </div>

      <div className="about-features">
        <section className="about-feature">
          <h3>지식 발견하기</h3>
          <p>오늘의 한입과 카드 목록에서 관심 있는 주제를 골라요. 목록에 없는 주제는 AI로 새 카드를 만들 수 있어요.</p>
        </section>
        <section className="about-feature">
          <h3>읽고 복습하기</h3>
          <p>카드를 읽다 궁금한 점은 AI에게 물어보세요. 퀴즈를 풀거나 내 말로 설명해 피드백을 받을 수 있어요.</p>
        </section>
        <section className="about-feature">
          <h3>내 학습 모아보기</h3>
          <p>로그인하면 카드를 북마크하거나 생성한 카드를 보관할 수 있어요. 마이페이지에서 학습 기록과 오답을 확인하고, 관심 분야를 설정해 홈 추천에 반영할 수 있어요.</p>
        </section>
      </div>

      <p className="about-ai-note">
        <Icon name="info" size={16} />
        <span>AI 기능에 입력한 주제·질문·설명은 응답 생성을 위해 AI 서비스로 전송돼요.</span>
      </p>

      <div className="about-actions">
        <button type="button" className="primary-button about-browse" onClick={onBrowse}>
          지식 둘러보기 <Icon name="arrow" size={17} />
        </button>
        <button type="button" className="primary-button about-generate" onClick={onGenerate}>
          새 지식 만들기
        </button>
      </div>
    </Modal>
  )
}

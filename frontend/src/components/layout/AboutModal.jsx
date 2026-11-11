import Icon from '../ui/Icon'
import Modal from '../ui/Modal'

export default function AboutModal({ onClose, onBrowse }) {
  return (
    <Modal label="한입지식 소개" onClose={onClose} className="generate-modal">
      <span className="large-icon">
        <Icon name="book" size={28} />
      </span>
      <span className="eyebrow">A BITE OF KNOWLEDGE</span>
      <h2>발견하면서 배우는 즐거움.</h2>
      <p className="about-copy">
        한입지식은 흥미로운 지식을 짧게 읽고, 질문하고, 퀴즈를 풀고, 자신의 말로
        설명하며 이해를 넓히는 서비스예요.
      </p>
      <div className="takeaway">
        <Icon name="sparkle" />
        <div>
          <strong>AI로 새 지식을 만들 수 있어요</strong>
          <p>
            궁금한 주제를 입력하면 AI가 만든 지식 카드를 바로 읽을 수 있어요.
            주제, 질문, 직접 작성한 설명은 응답을 생성하기 위해 AI 서비스로 전송돼요.
          </p>
        </div>
      </div>
      <button className="primary-button full-width" onClick={onBrowse}>
        첫 번째 호기심 만나기
        <Icon name="arrow" size={17} />
      </button>
    </Modal>
  )
}

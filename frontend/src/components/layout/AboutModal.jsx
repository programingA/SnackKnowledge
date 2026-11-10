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
          <strong>지금은 프론트 미리보기예요</strong>
          <p>
            6개의 샘플 지식과 퀴즈를 체험할 수 있어요. 로그인·영구 저장·실제 AI
            요청은 제공하지 않으며, 질문과 설명은 외부로 전송하지 않아요.
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

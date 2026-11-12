import AiResponseText from '../ui/AiResponseText'
import './GeneratedCards.css'

export default function GeneratedCardBody({ card, showImageFallback = false }) {
  return (
    <>
      {card.imageBase64 && (
        <img
          className="saved-generated-image"
          src={'data:image/webp;base64,' + card.imageBase64}
          alt={card.title + ' 주제 삽화'}
        />
      )}
      {showImageFallback && !card.imageBase64 && (
        <small>이미지를 생성하지 못했어요. 카드 내용은 아래에서 읽을 수 있어요.</small>
      )}
      <p className="generated-card-summary">{card.summary}</p>
      <AiResponseText text={card.content} />
    </>
  )
}

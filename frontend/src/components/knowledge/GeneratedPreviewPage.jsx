import GeneratedArticle from './GeneratedArticle'
import SaveGeneratedCardButton from './SaveGeneratedCardButton'

export default function GeneratedPreviewPage({ card, username, visible, onGenerate }) {
  return (
    <main className="page-shell article-page" id="generated-preview-page" tabIndex={-1} hidden={!visible}>
      <a className="article-back" href="#knowledge-feed">← 지식 목록으로</a>
      {card ? (
        <GeneratedArticle card={card} showImageFallback={Object.hasOwn(card, 'imageBase64')}>
          <SaveGeneratedCardButton card={card} username={username} />
          <button className="text-button" type="button" onClick={onGenerate}>다른 지식 만들기</button>
        </GeneratedArticle>
      ) : (
        <div className="generated-cards-panel">
          <p>열어볼 생성 카드가 없어요.</p>
          <button className="primary-button" type="button" onClick={onGenerate}>지식 카드 만들기</button>
        </div>
      )}
    </main>
  )
}

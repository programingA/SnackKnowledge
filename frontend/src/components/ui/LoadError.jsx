import Icon from './Icon'

export default function LoadError({ message, onRetry, heading: Heading = 'h2' }) {
  return (
    <div className="load-error">
      <div role="alert"><Heading>{message}</Heading></div>
      <button className="primary-button" type="button" onClick={onRetry}>
        <Icon name="refresh" size={17} />
        다시 시도
      </button>
    </div>
  )
}

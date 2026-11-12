export function LoadingSpinner() {
  return <span className="generate-loading-spinner" aria-hidden="true" />
}

export default function GenerationProgress({ children }) {
  return (
    <div className="generate-progress" role="status">
      <div className="generate-progress-track" aria-hidden="true"><span /></div>
      <p>{children}</p>
    </div>
  )
}


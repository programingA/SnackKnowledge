import './LoadingSkeleton.css'

export default function LoadingSkeleton({ label, layout = 'panel' }) {
  const repeated = layout === 'cards' || layout === 'rows'
  const classes = `loading-skeleton loading-skeleton--${layout}${layout === 'cards' ? ' card-grid' : ''}`

  return (
    <>
      <span className="sr-only" role="status">{label}</span>
      <div className={classes} aria-hidden="true">
        {(repeated ? [1, 2, 3] : [1]).map((index) => (
          <div className="loading-skeleton-item" key={index}>
            <span className="loading-skeleton-bar loading-skeleton-label" />
            <span className="loading-skeleton-bar loading-skeleton-title" />
            <span className="loading-skeleton-bar loading-skeleton-line" />
            {layout === 'article' && (
              <div className="loading-skeleton-body">
                <span className="loading-skeleton-bar" />
                <span className="loading-skeleton-bar" />
                <span className="loading-skeleton-bar loading-skeleton-line" />
              </div>
            )}
          </div>
        ))}
      </div>
    </>
  )
}

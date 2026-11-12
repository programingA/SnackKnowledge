export default function Icon({ name, size = 20, ...props }) {
  const paths = {
    arrow: (
      <>
        <path d="M5 12h14M13 6l6 6-6 6" />
      </>
    ),
    search: (
      <>
        <circle cx="10.5" cy="10.5" r="6.5" />
        <path d="m16 16 4 4" />
      </>
    ),
    sun: (
      <>
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5" />
      </>
    ),
    bread: (
      <>
        <path d="M5 11c-5-1-3-8 3-7 2-2 6-2 8 0 6-1 8 6 3 7v9H5zM9 12v4m6-4v4" />
      </>
    ),
    wifi: (
      <>
        <path d="M2 8a16 16 0 0 1 20 0M5 12a11 11 0 0 1 14 0m-11 4a6 6 0 0 1 8 0" />
        <circle cx="12" cy="20" r="1" />
      </>
    ),
    brain: (
      <>
        <path d="M12 6c-1-5-8-3-7 2-4 1-4 7 0 8-1 5 6 7 7 2 1 5 8 3 7-2 4-1 4-7 0-8 1-5-6-7-7-2v12M8 8l1 3m6 3 2 2M5 16l3-1m8-7-1 2" />
      </>
    ),
    leaf: (
      <>
        <path d="M20 3C8 1 2 8 5 15s17 4 15-12ZM5 20 16 8M8 14l5 1" />
      </>
    ),
    moon: <path d="M20 15A9 9 0 0 1 9 3a9 9 0 1 0 11 12Z" />,
    sparkle: (
      <>
        <path d="m12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5L12 3Z" />
        <path d="M20 2v4m-2-2h4" />
      </>
    ),
    refresh: <path d="M20 11a8 8 0 1 0-2 6M20 5v6h-6" />,
    close: <path d="m6 6 12 12M6 18 18 6" />,
    clock: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </>
    ),
    shuffle: (
      <>
        <path d="M3 6h3c4 0 8 12 12 12h3m-4-4 4 4-4 4M3 18h3c1.5 0 3-2 4-4m4-4c1-2 2.5-4 4-4h3m-4-4 4 4-4 4" />
      </>
    ),
    check: <path d="m5 12 4 4L19 6" />,
    bookmark: <path d="M6 4h12v16l-6-4-6 4V4Z" />,
    book: (
      <>
        <path d="M12 5C8 2 4 3 2 4v15c4-2 7-1 10 1 3-2 6-3 10-1V4c-3-1-7-2-10 1v15" />
      </>
    ),
  }
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {paths[name] || paths.sparkle}
    </svg>
  )
}

export default function AiResponseText({ text }) {
  const parts = text.split(/\*\*([^*\r\n]+)\*\*/g)

  return (
    <p style={{ whiteSpace: 'pre-wrap' }}>
      {parts.map((part, index) =>
        index % 2 === 1 ? <strong key={index}>{part}</strong> : part,
      )}
    </p>
  )
}

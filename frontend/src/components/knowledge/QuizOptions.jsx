export default function QuizOptions({ questionId, options, selectedIndex, correctIndex, onSelect, disabled }) {
  const graded = correctIndex !== undefined

  return (
    <fieldset className="quiz-options" aria-labelledby={questionId} disabled={disabled || graded}>
      {options.map((option, index) => {
        const selected = index === selectedIndex
        const correct = index === correctIndex
        const state = correct ? ' correct' : graded && selected ? ' wrong' : ''

        return (
          <label className={`option${state}`} key={index}>
            <input type="radio" name={questionId} checked={selected} onChange={() => onSelect(index)} />
            <span className="option-text">{option}</span>
            {graded && (selected || correct) && (
              <span className="option-status">
                {selected && correct ? '내 답 · 정답' : correct ? '정답' : '내 답'}
              </span>
            )}
          </label>
        )
      })}
    </fieldset>
  )
}

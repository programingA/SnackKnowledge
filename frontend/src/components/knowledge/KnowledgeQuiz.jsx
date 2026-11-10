import { useState } from "react";
import { generateKnowledgeQuiz } from "../../api/knowledge";

export default function KnowledgeQuiz({ id }) {
    const [quiz, setQuiz] = useState(null)
    const [selectedIndex, setSelectedIndex] = useState(null)
    const [submitted, setSubmitted] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    async function handleGenerate() {
        if (loading) return

        setLoading(true)
        setError('')

        try {
            const newQuiz = await generateKnowledgeQuiz(id)
            setQuiz(newQuiz)
            setSelectedIndex(null)
            setSubmitted(false)
        } catch (error) {
            setError(error.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <section>
            <h3>퀴즈로 복습하기</h3>
            <button
                type="button"
                className="primary-button"
                onClick={handleGenerate}
                disabled={loading}
            >
                {loading ? '문제를 만드는 중...' : '퀴즈 만들기'}
            </button>

            {error && <p role="alert">{error}</p>}

            {quiz && (
                <>
                   <fieldset className="quiz-options" disabled={loading || submitted}>
                        <legend>{quiz.question}</legend>
                        {quiz.options.map((option, index) => (
                            <label className="option" key={index}>
                                <input
                                    type="radio"
                                    name="quiz-option"
                                    checked={selectedIndex === index}
                                    onChange={() => setSelectedIndex(index)}
                                />
                                {option}
                            </label>
                        ))}
                   </fieldset>

                   {!submitted && (
                    <button
                        type="button"
                        className="primary-button"
                        disabled={loading || selectedIndex === null}
                        onClick={() => setSubmitted(true)}
                    >
                        정답 확인하기
                    </button>
                   )}

                   {submitted && (
                    <div className="response" role="status">
                        <strong>
                            {selectedIndex === quiz.correctIndex ? '정답이에요!' : '오답이에요.'}
                        </strong>
                        <p>정답: {quiz.options[quiz.correctIndex]}</p>
                        <p>{quiz.explanation}</p>
                    </div>
                   )}
                </>
            )}
        </section>
    )
}

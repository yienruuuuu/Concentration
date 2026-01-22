import { useState, useEffect, useCallback, useRef } from 'react'

export default function Game({ onFinish, duration }) {
    const [timeLeft, setTimeLeft] = useState(duration)
    const [hasStarted, setHasStarted] = useState(false)
    const [numbers, setNumbers] = useState({ left: 0, right: 0 })

    const historyRef = useRef([])
    const firstAnswerTimeRef = useRef(null)
    const questionStartTimeRef = useRef(null)

    const generateNumbers = () => {
        let n1 = Math.floor(Math.random() * 99) + 1
        let n2 = Math.floor(Math.random() * 99) + 1
        while (n1 === n2) {
            n2 = Math.floor(Math.random() * 99) + 1
        }
        return { left: n1, right: n2 }
    }

    // Initial setup
    useEffect(() => {
        setNumbers(generateNumbers())
        firstAnswerTimeRef.current = null
        questionStartTimeRef.current = null
        historyRef.current = []
    }, [])

    // Timer logic
    useEffect(() => {
        if (!hasStarted) return
        setTimeLeft(duration)
        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(timer)
                    return 0
                }
                return prev - 1
            })
        }, 1000)
        return () => clearInterval(timer)
    }, [hasStarted, duration])

    // End game trigger
    useEffect(() => {
        if (timeLeft === 0) {
            onFinish(historyRef.current)
        }
    }, [timeLeft, onFinish])

    // Input Handler
    const handleInput = useCallback((direction) => {
        if (timeLeft <= 0) return

        const now = Date.now()
        const isLeftLarger = numbers.left > numbers.right
        const isCorrect = (direction === 'left' && isLeftLarger) || (direction === 'right' && !isLeftLarger)
        const isFirstAnswer = firstAnswerTimeRef.current === null
        if (isFirstAnswer) {
            firstAnswerTimeRef.current = now
            setHasStarted(true)
        }
        const responseTime = isFirstAnswer || questionStartTimeRef.current === null
            ? 0
            : now - questionStartTimeRef.current

        // Record history
        historyRef.current.push({
            timeOffset: now - firstAnswerTimeRef.current, // Time relative to first answer in ms
            responseTime: responseTime,
            correct: isCorrect,
            pair: { ...numbers },
            choice: direction
        })

        // Next question
        setNumbers(generateNumbers())
        questionStartTimeRef.current = Date.now()
    }, [numbers, timeLeft])

    // Keyboard listener
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'ArrowLeft') {
                handleInput('left')
            } else if (e.key === 'ArrowRight') {
                handleInput('right')
            }
        }
        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [handleInput])

    const totalAnswered = historyRef.current.length
    const correctAnswered = historyRef.current.reduce((sum, item) => sum + (item.correct ? 1 : 0), 0)
    const progressPercent = duration > 0 ? (timeLeft / duration) * 100 : 0

    // Add click handlers for mobile/mouse support too
    return (
        <div className="card fade-in">
            <div className="timer" style={{ color: timeLeft < 10 ? '#ef4444' : '#94a3b8' }}>
                剩餘時間：{timeLeft}s
            </div>

            <div className="progress-track" aria-hidden="true">
                <div className="progress-bar" style={{ width: `${progressPercent}%` }} />
            </div>

            <div className="helper-text">
                已作答 <strong>{totalAnswered}</strong> 題，正確 <strong>{correctAnswered}</strong> 題
            </div>

            <div className="number-container">
                <div
                    className="number-display"
                    onClick={() => handleInput('left')}
                    style={{ cursor: 'pointer' }}
                >
                    {numbers.left}
                </div>
                <div
                    className="number-display"
                    onClick={() => handleInput('right')}
                    style={{ cursor: 'pointer' }}
                >
                    {numbers.right}
                </div>
            </div>

            <div style={{ color: '#64748b', fontSize: '0.95rem' }}>
                使用方向鍵或點擊數字作答
            </div>
        </div>
    )
}

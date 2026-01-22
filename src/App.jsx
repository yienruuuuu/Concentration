import { useState } from 'react'
import Game from './components/Game'
import Results from './components/Results'

function App() {
  const [gameState, setGameState] = useState('start') // start, playing, finished
  const [gameData, setGameData] = useState(null)
  const [nickname, setNickname] = useState('')
  const [duration, setDuration] = useState(60)

  const handleStart = () => {
    const trimmed = nickname.trim()
    if (!trimmed) return
    setNickname(trimmed)
    setGameState('playing')
    setGameData(null)
  }

  const handleFinish = (data) => {
    setGameData(data)
    setGameState('finished')
  }

  const handleRestart = () => {
    setGameState('start')
  }

  return (
    <div style={{ width: '100%', maxWidth: '800px', margin: '0 auto' }}>
      {gameState === 'start' && (
        <div className="card fade-in">
          <h1>數字比較</h1>
          <div style={{ marginBottom: '2.5rem', color: '#94a3b8', lineHeight: '1.8' }}>
            <p>比較左右數字，選出較大的那一個。</p>
            <div style={{ marginTop: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', alignItems: 'center' }}>
              <label htmlFor="nickname" style={{ color: '#cbd5e1' }}>請輸入暱稱</label>
              <input
                id="nickname"
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                maxLength={16}
                placeholder="最多 16 字"
                style={{
                  width: '100%',
                  maxWidth: '360px',
                  padding: '0.75rem 1rem',
                  borderRadius: '10px',
                  border: '1px solid #334155',
                  background: '#0f172a',
                  color: '#e2e8f0'
                }}
              />
              <label htmlFor="duration" style={{ color: '#cbd5e1' }}>測驗秒數</label>
              <select
                id="duration"
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                style={{
                  width: '100%',
                  maxWidth: '360px',
                  padding: '0.75rem 1rem',
                  borderRadius: '10px',
                  border: '1px solid #334155',
                  background: '#0f172a',
                  color: '#e2e8f0'
                }}
              >
                <option value={10}>10 秒</option>
                <option value={30}>30 秒</option>
                <option value={60}>60 秒</option>
              </select>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', margin: '1.5rem 0', flexWrap: 'wrap' }}>
              <span style={{ 
                padding: '0.5rem 1rem', 
                background: '#334155', 
                borderRadius: '8px',
                fontFamily: 'monospace' 
              }}>← 左方向鍵</span>
              <span style={{ 
                padding: '0.5rem 1rem', 
                background: '#334155', 
                borderRadius: '8px',
                fontFamily: 'monospace' 
              }}>→ 右方向鍵</span>
              <span style={{ 
                padding: '0.5rem 1rem', 
                background: '#334155', 
                borderRadius: '8px',
                fontFamily: 'monospace' 
              }}>點擊數字也可作答</span>
            </div>
            <p>你有 <strong>{duration} 秒</strong>，盡可能答對更多題目。</p>
          </div>
          <button
            onClick={handleStart}
            disabled={!nickname.trim()}
            style={{ fontSize: '1.15rem', padding: '0.9rem 2.6rem', opacity: nickname.trim() ? 1 : 0.6 }}
          >
            開始遊戲
          </button>
        </div>
      )}

      {gameState === 'playing' && (
        <Game onFinish={handleFinish} duration={duration} />
      )}

      {gameState === 'finished' && (
        <Results data={gameData} onRestart={handleRestart} nickname={nickname} duration={duration} />
      )}
    </div>
  )
}

export default App

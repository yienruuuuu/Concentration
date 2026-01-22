import { useState, useEffect } from 'react'
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
} from 'chart.js'
import { Line } from 'react-chartjs-2'
import qrImageUrl from '../assets/qr.png'

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
)

const SHARE_WIDTH = 1200
const SHARE_HEIGHT = 675
const QR_SIZE = 140
const backgroundModules = import.meta.glob('../assets/share-backgrounds/*.{png,jpg,jpeg,webp}', {
    eager: true,
    import: 'default'
})
const backgroundUrls = Object.values(backgroundModules)

export default function Results({ data, onRestart, nickname, duration }) {
    const [isSharing, setIsSharing] = useState(false)
    const [shareError, setShareError] = useState('')
    const [shareImageUrl, setShareImageUrl] = useState('')

    const correctCount = data.filter(d => d.correct).length
    const total = data.length
    const accuracy = total > 0 ? ((correctCount / total) * 100).toFixed(1) : 0
    const avgResponseTime = total > 0 ? (data.reduce((a, b) => a + b.responseTime, 0) / total).toFixed(0) : 0
    const displayName = nickname && nickname.trim() ? nickname.trim() : '玩家'

    const chartSource = data.filter((item, index) => !(index === 0 && item.responseTime === 0))
    const chartData = {
        labels: chartSource.map(d => Math.round(d.timeOffset / 1000)),
        datasets: [
            {
                label: '反應時間（ms）',
                data: chartSource.map(d => d.responseTime),
                borderColor: '#647eff',
                backgroundColor: 'rgba(100, 126, 255, 0.5)',
                pointBackgroundColor: chartSource.map(d => d.correct ? '#4ade80' : '#ef4444'),
                pointBorderColor: chartSource.map(d => d.correct ? '#4ade80' : '#ef4444'),
                pointRadius: 6,
                tension: 0.3
            }
        ]
    }

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            x: {
                title: { display: true, text: '時間（秒）', color: '#94a3b8' },
                grid: { color: '#334155' },
                ticks: { color: '#94a3b8' }
            },
            y: {
                title: { display: true, text: '反應時間（ms）', color: '#94a3b8' },
                grid: { color: '#334155' },
                ticks: { color: '#94a3b8' }
            }
        },
        plugins: {
            legend: {
                position: 'top',
                labels: { color: '#cbd5e1' }
            },
            title: {
                display: false,
                text: '表現趨勢',
                color: '#cbd5e1'
            },
            tooltip: {
                callbacks: {
                    label: (context) => {
                        const d = chartSource[context.dataIndex];
                        return `反應時間：${d.responseTime}ms（${d.correct ? '正確' : '錯誤'}）`;
                    }
                }
            }
        },
    }

    const handleShare = async () => {
        setShareError('')
        if (backgroundUrls.length === 0) {
            setShareError('請先放入分享背景圖')
            return
        }

        setIsSharing(true)
        try {
            const loadImage = (src) => new Promise((resolve, reject) => {
                const img = new Image()
                img.onload = () => resolve(img)
                img.onerror = () => reject(new Error('load-failed'))
                img.src = src
            })

            const bgUrl = backgroundUrls[Math.floor(Math.random() * backgroundUrls.length)]
            const image = await loadImage(bgUrl)
            const qrImage = await loadImage(qrImageUrl)

            const canvas = document.createElement('canvas')
            canvas.width = SHARE_WIDTH
            canvas.height = SHARE_HEIGHT
            const ctx = canvas.getContext('2d')
            if (!ctx) throw new Error('no-context')

            const scale = Math.max(SHARE_WIDTH / image.width, SHARE_HEIGHT / image.height)
            const drawWidth = image.width * scale
            const drawHeight = image.height * scale
            const offsetX = (SHARE_WIDTH - drawWidth) / 2
            const offsetY = (SHARE_HEIGHT - drawHeight) / 2
            ctx.drawImage(image, offsetX, offsetY, drawWidth, drawHeight)

            const gradient = ctx.createLinearGradient(SHARE_WIDTH, 0, 0, 0)
            gradient.addColorStop(0, 'rgba(2, 6, 23, 0)')
            gradient.addColorStop(1, 'rgba(2, 6, 23, 0.75)')
            ctx.fillStyle = gradient
            ctx.fillRect(0, 0, SHARE_WIDTH, SHARE_HEIGHT)

            ctx.fillStyle = '#e2e8f0'
            ctx.font = 'bold 48px "Segoe UI", "Noto Sans TC", sans-serif'
            ctx.fillText(`${displayName} 的成績`, 90, 130)

            ctx.font = '26px "Segoe UI", "Noto Sans TC", sans-serif'
            ctx.fillText(`分數：${correctCount} / ${total}`, 90, 210)
            ctx.fillText(`正確率：${accuracy}%`, 90, 255)
            ctx.fillText(`平均反應：${avgResponseTime} ms`, 90, 300)
            ctx.fillText(`本次秒數：${duration} 秒`, 90, 345)

            ctx.fillStyle = '#cbd5e1'
            ctx.font = '22px "Segoe UI", "Noto Sans TC", sans-serif'
            ctx.fillText(`數字比較 ${duration} 秒挑戰`, 90, SHARE_HEIGHT - 100)
            ctx.font = '20px "Segoe UI", "Noto Sans TC", sans-serif'
            ctx.fillText('https://concentration-yienruuuuu.pages.dev/', 90, SHARE_HEIGHT - 60)

            const qrX = 90
            const qrY = SHARE_HEIGHT - 100 - QR_SIZE - 20
            ctx.save()
            ctx.shadowColor = 'rgba(15, 23, 42, 0.6)'
            ctx.shadowBlur = 12
            ctx.shadowOffsetY = 4
            ctx.drawImage(qrImage, qrX, qrY, QR_SIZE, QR_SIZE)
            ctx.restore()

            const dataUrl = canvas.toDataURL('image/png')
            if (!dataUrl) throw new Error('export-failed')

            setShareImageUrl(dataUrl)
        } catch (err) {
            setShareError('產生分享圖失敗，請再試一次')
        } finally {
            setIsSharing(false)
        }
    }

    const handleDownload = () => {
        if (!shareImageUrl) return
        const link = document.createElement('a')
        link.href = shareImageUrl
        link.download = `number-compare-${Date.now()}.png`
        document.body.appendChild(link)
        link.click()
        link.remove()
    }

    useEffect(() => {
        return () => {
            if (shareImageUrl && shareImageUrl.startsWith('blob:')) {
                URL.revokeObjectURL(shareImageUrl)
            }
        }
    }, [shareImageUrl])

    return (
        <div className="card fade-in">
            <h2 style={{ marginTop: 0 }}>結果</h2>

            <div className="stats-grid">
                <div className="stat-item">
                    <span className="stat-label">分數</span>
                    <span className="stat-value" style={{ color: '#647eff' }}>{correctCount} / {total}</span>
                </div>
                <div className="stat-item">
                    <span className="stat-label">正確率</span>
                    <span className="stat-value" style={{ color: Number(accuracy) >= 80 ? '#4ade80' : '#ef4444' }}>
                        {accuracy}%
                    </span>
                </div>
                <div className="stat-item">
                    <span className="stat-label">平均反應</span>
                    <span className="stat-value">{avgResponseTime} ms</span>
                </div>
                <div className="stat-item">
                    <span className="stat-label">本次秒數</span>
                    <span className="stat-value">{duration} 秒</span>
                </div>
            </div>

            <div style={{ marginTop: '2rem', height: '400px', width: '100%' }}>
                <Line options={options} data={chartData} />
            </div>

            <div style={{ marginTop: '2rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                <button onClick={onRestart}>
                    再玩一次
                </button>
                <button onClick={handleShare} disabled={isSharing}>
                    {isSharing ? '產生中...' : '分享下載'}
                </button>
                <button onClick={handleDownload} disabled={!shareImageUrl}>
                    下載圖片
                </button>
            </div>

            {shareImageUrl && (
                <div style={{ marginTop: '1.5rem' }}>
                    <img
                        src={shareImageUrl}
                        alt="分享圖片預覽"
                        style={{ width: '100%', borderRadius: '16px', border: '1px solid #1f2937' }}
                    />
                </div>
            )}

            {shareError && (
                <div style={{ marginTop: '0.75rem', color: '#fca5a5' }}>
                    {shareError}
                </div>
            )}
        </div>
    )
}

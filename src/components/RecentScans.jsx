import { History, Leaf, Trash2 } from 'lucide-react'
import '../styles/recentScans.css'

function relativeTime(iso) {
  const then = new Date(iso).getTime()
  if (Number.isNaN(then)) return ''
  const diff = Date.now() - then
  const mins = Math.round(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.round(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.round(hours / 24)
  return days === 1 ? 'yesterday' : `${days}d ago`
}

function RecentScans({ scans, onOpen, onClear }) {
  if (!scans.length) return null

  return (
    <section className="recent" aria-labelledby="recent-heading">
      <div className="recent-head">
        <h2 id="recent-heading">
          <History size={18} />
          Recent scans
        </h2>
        <button className="btn btn-ghost recent-clear" onClick={onClear}>
          <Trash2 size={15} />
          Clear
        </button>
      </div>

      <p className="recent-note">Stored only on this device — nothing is uploaded or shared.</p>

      <div className="recent-grid">
        {scans.map((scan) => (
          <button key={scan.id} className="recent-card" onClick={() => onOpen(scan)}>
            <span className="recent-thumb">
              {scan.thumbnail ? (
                <img src={scan.thumbnail} alt="" />
              ) : (
                <Leaf size={20} />
              )}
            </span>
            <span className="recent-body">
              <span className={`recent-verdict ${scan.healthy ? 'healthy' : 'attention'}`}>
                {scan.disease}
              </span>
              <span className="recent-time">{relativeTime(scan.timestamp)}</span>
            </span>
          </button>
        ))}
      </div>
    </section>
  )
}

export default RecentScans

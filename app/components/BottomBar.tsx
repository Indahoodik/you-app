'use client'
import { useRouter, usePathname } from 'next/navigation'
import { Home, Search, PlusSquare, MessageCircle, User } from 'lucide-react'

const tabs = [
  { icon: Home, label: 'Лента', path: '/' },
  { icon: Search, label: 'Пошук', path: '/search' },
  { icon: PlusSquare, label: 'Пост', path: '/create' },
  { icon: MessageCircle, label: 'Чат', path: '/chat' },
  { icon: User, label: 'Профіль', path: '/profile' },
]

export default function BottomBar() {
  const router = useRouter()
  const pathname = usePathname()

  return (
    <div style={{
      position:'fixed', bottom:0, left:0, right:0,
      background:'var(--bg)', borderTop:'1px solid var(--border)',
      display:'flex', justifyContent:'space-around',
      padding:'10px 0 24px', zIndex:100
    }}>
      {tabs.map(({ icon: Icon, label, path }) => {
        const isActive = pathname === path
        return (
          <button
            key={path}
            onClick={() => router.push(path)}
            style={{
              background:'none', border:'none', cursor:'pointer',
              display:'flex', flexDirection:'column', alignItems:'center', gap:'4px',
              color: isActive ? 'var(--accent)' : 'var(--text3)',
              transition:'transform 0.15s, color 0.2s',
              position:'relative'
            }}
            onMouseDown={e => (e.currentTarget.style.transform = 'scale(0.82)')}
            onMouseUp={e => (e.currentTarget.style.transform = 'scale(1)')}
            onTouchStart={e => (e.currentTarget.style.transform = 'scale(0.82)')}
            onTouchEnd={e => (e.currentTarget.style.transform = 'scale(1)')}
          >
            {isActive && (
              <div style={{
                position:'absolute', top:'-10px', left:'50%', transform:'translateX(-50%)',
                width:'20px', height:'3px', borderRadius:'999px',
                background:'var(--accent)',
                animation:'slideIn 0.2s ease'
              }}/>
            )}
            <Icon size={22} strokeWidth={isActive ? 2.5 : 1.8} />
            <span style={{fontSize:'10px', fontWeight: isActive ? 600 : 400}}>
              {label}
            </span>
          </button>
        )
      })}
    </div>
  )
}
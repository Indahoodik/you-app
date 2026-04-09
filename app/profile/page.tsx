'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTheme } from '../context/ThemeContext'
import PageTransition from '../components/PageTransition'

const myPosts = [
  { text: 'Новий патч 7.38 — керлі стак тепер не той 😭', likes: 42, comments: 15, sub: 'Dota 2' },
  { text: 'Хто збирається на LAN турнір у Києві? 👇', likes: 31, comments: 44, sub: 'CS2' },
  { text: 'Топ 5 ігор цього року на мою думку 😄', likes: 56, comments: 19, sub: 'Valorant' },
]

export default function ProfilePage() {
  const router = useRouter()
  const { theme, toggleTheme } = useTheme()
  const [activeTab, setActiveTab] = useState('posts')
  const [showSettings, setShowSettings] = useState(false)

  return (
    <PageTransition>
      <main>
        <div style={{
          position:'fixed', top:0, left:0, right:0, zIndex:100,
          background:'var(--bg)', borderBottom:'1px solid var(--border)',
          display:'flex', alignItems:'center', justifyContent:'space-between',
          padding:'14px 16px'
        }}>
          <button onClick={() => router.back()} style={{background:'none', border:'none', color:'var(--text)', fontSize:'20px', cursor:'pointer'}}>←</button>
          <span style={{fontWeight:600, fontSize:'16px', color:'var(--text)'}}>Профіль</span>
          <button onClick={() => setShowSettings(!showSettings)} style={{background:'none', border:'none', color:'var(--text)', fontSize:'20px', cursor:'pointer'}}>⚙️</button>
        </div>

        {showSettings && (
          <div className="animate-scale" style={{
            position:'fixed', top:'58px', right:'12px', zIndex:200,
            background:'var(--bg2)', border:'1px solid var(--border)',
            borderRadius:'14px', padding:'8px', minWidth:'200px',
            boxShadow:'0 8px 32px rgba(0,0,0,0.4)'
          }}>
            <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', padding:'12px 14px', borderRadius:'10px'}}>
              <div style={{display:'flex', alignItems:'center', gap:'10px'}}>
                <span style={{fontSize:'18px'}}>{theme === 'dark' ? '🌙' : '☀️'}</span>
                <span style={{fontSize:'14px', color:'var(--text)'}}>{theme === 'dark' ? 'Темна тема' : 'Світла тема'}</span>
              </div>
              <div onClick={toggleTheme} style={{
                width:'44px', height:'24px', borderRadius:'999px', cursor:'pointer',
                background: theme === 'dark' ? 'var(--accent)' : '#ddd',
                position:'relative', transition:'background 0.3s'
              }}>
                <div style={{
                  position:'absolute', top:'3px',
                  left: theme === 'dark' ? '22px' : '3px',
                  width:'18px', height:'18px', borderRadius:'50%',
                  background:'#fff', transition:'left 0.3s'
                }}/>
              </div>
            </div>
            <div style={{height:'1px', background:'var(--border)', margin:'4px 0'}}/>
            <button style={{
              width:'100%', padding:'12px 14px', borderRadius:'10px',
              background:'none', border:'none', color:'#ef4444',
              fontSize:'14px', cursor:'pointer', textAlign:'left',
              display:'flex', alignItems:'center', gap:'10px'
            }}>
              <span>🚪</span> Вийти
            </button>
          </div>
        )}

        {showSettings && <div onClick={() => setShowSettings(false)} style={{position:'fixed', inset:0, zIndex:150}}/>}

        <div style={{maxWidth:'580px', margin:'0 auto', padding:'70px 16px 90px'}}>
          <div className="animate-fade-up" style={{display:'flex', alignItems:'center', gap:'16px', marginBottom:'20px'}}>
            <div style={{
              width:'72px', height:'72px', borderRadius:'50%', flexShrink:0,
              background:'linear-gradient(135deg, #7c3aed, #ec4899)'
            }}/>
            <div>
              <p style={{fontSize:'20px', fontWeight:700, color:'var(--text)'}}>alex_ua</p>
              <p style={{fontSize:'14px', color:'var(--text3)', marginTop:'2px'}}>🇺🇦 Київ</p>
            </div>
          </div>

          <p className="animate-fade-up delay-1" style={{fontSize:'14px', color:'var(--text2)', lineHeight:'1.5', marginBottom:'20px'}}>
            Геймер, розробник, люблю каву ☕ і Dota 2 🎮
          </p>

          <div className="animate-fade-up delay-2" style={{
            display:'grid', gridTemplateColumns:'1fr 1fr 1fr',
            gap:'1px', background:'var(--border)', borderRadius:'12px',
            overflow:'hidden', marginBottom:'20px'
          }}>
            {[
              { label: 'Пости', value: '24' },
              { label: 'Підписники', value: '1.2K' },
              { label: 'Підписки', value: '348' },
            ].map(stat => (
              <div key={stat.label} style={{background:'var(--bg2)', padding:'14px', textAlign:'center'}}>
                <p style={{fontSize:'18px', fontWeight:700, color:'var(--text)'}}>{stat.value}</p>
                <p style={{fontSize:'12px', color:'var(--text3)', marginTop:'2px'}}>{stat.label}</p>
              </div>
            ))}
          </div>

          <button className="animate-fade-up delay-3" style={{
            width:'100%', padding:'10px', borderRadius:'10px',
            background:'none', border:'1px solid var(--border)', color:'var(--text)',
            fontSize:'14px', cursor:'pointer', marginBottom:'20px'
          }}>
            Редагувати профіль
          </button>

          <div style={{display:'flex', borderBottom:'1px solid var(--border)', marginBottom:'16px'}}>
            {['posts', 'likes'].map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)} style={{
                flex:1, padding:'10px', background:'none', border:'none',
                color: activeTab === tab ? 'var(--text)' : 'var(--text3)',
                borderBottom: activeTab === tab ? '2px solid var(--accent)' : '2px solid transparent',
                cursor:'pointer', fontSize:'14px', fontWeight: activeTab === tab ? 600 : 400
              }}>
                {tab === 'posts' ? '📝 Пости' : '❤️ Вподобання'}
              </button>
            ))}
          </div>

          {myPosts.map((post, i) => (
            <div key={i} className={`post animate-fade-up delay-${i+1}`} style={{cursor:'pointer'}} onClick={() => router.push('/post')}>
              <div className="post-header">
                <div style={{
                  width:'38px', height:'38px', borderRadius:'50%', flexShrink:0,
                  background:'linear-gradient(135deg, #7c3aed, #ec4899)'
                }}/>
                <div>
                  <p className="username">alex_ua</p>
                  <div style={{display:'flex', alignItems:'center', gap:'6px'}}>
                    <p className="time">вчора</p>
                    <span style={{color:'var(--text3)', fontSize:'11px'}}>·</span>
                    <span style={{fontSize:'11px', color:'var(--accent)'}}>{post.sub}</span>
                  </div>
                </div>
              </div>
              <p className="post-text">{post.text}</p>
              <div className="post-actions">
                <button className="action-btn" onClick={e => e.stopPropagation()}>❤️ {post.likes}</button>
                <button className="action-btn" onClick={e => e.stopPropagation()}>💬 {post.comments}</button>
                <button className="action-btn" onClick={e => e.stopPropagation()}>🔁 Поділитись</button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </PageTransition>
  )
}
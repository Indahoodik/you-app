'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import PageTransition from '../components/PageTransition'

const trending = [
  { tag: 'Dota 2', posts: '1.2K постів' },
  { tag: 'Усик', posts: '3.4K постів' },
  { tag: 'Atlas Weekend', posts: '890 постів' },
  { tag: 'CS2', posts: '2.1K постів' },
  { tag: 'Дюна 2', posts: '654 пости' },
  { tag: 'AI', posts: '4.5K постів' },
]

const allPosts = [
  { user: 'dota_fan', text: 'Новий патч 7.38 — керлі стак тепер не той 😭', sub: 'Dota 2', gradient: 'avatar-gradient-1' },
  { user: 'boxing_ua', text: 'Усик знову чемпіон. Пишаємось 🥊👑', sub: 'Бокс', gradient: 'avatar-gradient-3' },
  { user: 'music_ua', text: 'Новий альбом Океану Ельзи 🎶', sub: 'Музика', gradient: 'avatar-gradient-2' },
  { user: 'dev_ua', text: 'Next.js 15 вийшов — є крута нова фіча ⚡', sub: 'Програмування', gradient: 'avatar-gradient-4' },
  { user: 'cinema_ua', text: 'Дюна 2 — найкращий фільм року 🏜️', sub: 'Фільми', gradient: 'avatar-gradient-5' },
]

export default function SearchPage() {
  const router = useRouter()
  const [query, setQuery] = useState('')

  const filtered = query.trim()
    ? allPosts.filter(p =>
        p.text.toLowerCase().includes(query.toLowerCase()) ||
        p.user.toLowerCase().includes(query.toLowerCase()) ||
        p.sub.toLowerCase().includes(query.toLowerCase())
      )
    : []

  return (
    <PageTransition>
      <main>
        <div style={{
          position:'fixed', top:0, left:0, right:0, zIndex:100,
          background:'var(--bg)', borderBottom:'1px solid var(--border)',
          padding:'12px 16px'
        }}>
          <div style={{display:'flex', alignItems:'center', gap:'10px',
            background:'var(--bg3)', borderRadius:'12px', padding:'10px 14px'}}>
            <span style={{color:'var(--text3)'}}>🔍</span>
            <input autoFocus value={query} onChange={e => setQuery(e.target.value)}
              placeholder="Пошук постів, людей, тем..."
              style={{flex:1, background:'none', border:'none', color:'var(--text)',
                fontSize:'15px', outline:'none', fontFamily:'inherit'}}
            />
            {query && <button onClick={() => setQuery('')} style={{background:'none', border:'none', color:'var(--text3)', cursor:'pointer'}}>✕</button>}
          </div>
        </div>

        <div style={{maxWidth:'580px', margin:'0 auto', padding:'70px 16px 90px'}}>
          {query.trim() ? (
            <>
              <p style={{fontSize:'13px', color:'var(--text3)', marginBottom:'16px'}}>
                {filtered.length > 0 ? `Знайдено ${filtered.length} результати` : 'Нічого не знайдено'}
              </p>
              {filtered.map((post, i) => (
                <div key={i} className="post" style={{cursor:'pointer'}} onClick={() => router.push('/post')}>
                  <div className="post-header">
                    <div className={`avatar ${post.gradient}`} />
                    <div>
                      <p className="username">{post.user}</p>
                      <span style={{fontSize:'11px', color:'var(--accent)'}}>{post.sub}</span>
                    </div>
                  </div>
                  <p className="post-text">{post.text}</p>
                </div>
              ))}
            </>
          ) : (
            <>
              <p style={{fontSize:'15px', fontWeight:600, marginBottom:'16px', color:'var(--text)'}}>🔥 В тренді</p>
              {trending.map((item, i) => (
                <div key={i} onClick={() => setQuery(item.tag)} style={{
                  display:'flex', alignItems:'center', justifyContent:'space-between',
                  padding:'14px 0', borderBottom:'1px solid var(--border)', cursor:'pointer'
                }}>
                  <div style={{display:'flex', alignItems:'center', gap:'12px'}}>
                    <div style={{width:'42px', height:'42px', borderRadius:'10px',
                      background:'var(--bg3)', display:'flex', alignItems:'center',
                      justifyContent:'center', color:'var(--text3)', fontSize:'16px', fontWeight:700}}>#</div>
                    <div>
                      <p style={{fontSize:'14px', fontWeight:600, color:'var(--text)'}}>#{item.tag}</p>
                      <p style={{fontSize:'12px', color:'var(--text3)', marginTop:'2px'}}>{item.posts}</p>
                    </div>
                  </div>
                  <span style={{color:'var(--text3)', fontSize:'18px'}}>›</span>
                </div>
              ))}
            </>
          )}
        </div>
      </main>
    </PageTransition>
  )
}
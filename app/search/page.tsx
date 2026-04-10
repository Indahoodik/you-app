'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import PageTransition from '../components/PageTransition'
import { supabase } from '../lib/supabase'

const trending = [
  { tag: 'Dota 2', posts: '1.2K постів' },
  { tag: 'Усик', posts: '3.4K постів' },
  { tag: 'Atlas Weekend', posts: '890 постів' },
  { tag: 'CS2', posts: '2.1K постів' },
  { tag: 'Дюна 2', posts: '654 пости' },
  { tag: 'AI', posts: '4.5K постів' },
]

export default function SearchPage() {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [activeTab, setActiveTab] = useState<'posts' | 'users'>('posts')
  const [posts, setPosts] = useState<any[]>([])
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const handleSearch = async (q: string) => {
    setQuery(q)
    if (!q.trim()) { setPosts([]); setUsers([]); return }
    setLoading(true)

    const [{ data: postsData }, { data: usersData }] = await Promise.all([
      supabase
        .from('posts')
        .select('*, profiles(username, avatar_url)')
        .ilike('text', `%${q}%`)
        .limit(20),
      supabase
        .from('profiles')
        .select('*')
        .ilike('username', `%${q}%`)
        .limit(20),
    ])

    setPosts(postsData || [])
    setUsers(usersData || [])
    setLoading(false)
  }

  return (
    <PageTransition>
      <main>
        <div style={{
          position:'fixed', top:0, left:0, right:0, zIndex:100,
          background:'var(--bg)', borderBottom:'1px solid var(--border)',
          padding:'12px 16px'
        }}>
          <div style={{
            display:'flex', alignItems:'center', gap:'10px',
            background:'var(--bg3)', borderRadius:'12px', padding:'10px 14px',
            marginBottom:'10px'
          }}>
            <span style={{color:'var(--text3)'}}>🔍</span>
            <input
              autoFocus
              value={query}
              onChange={e => handleSearch(e.target.value)}
              placeholder="Пошук постів, людей..."
              style={{
                flex:1, background:'none', border:'none', color:'var(--text)',
                fontSize:'15px', outline:'none', fontFamily:'inherit'
              }}
            />
            {query && (
              <button onClick={() => handleSearch('')} style={{background:'none', border:'none', color:'var(--text3)', cursor:'pointer'}}>✕</button>
            )}
          </div>

          {query.trim() && (
            <div style={{display:'flex', gap:'0'}}>
              {(['posts', 'users'] as const).map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)} style={{
                  flex:1, padding:'8px', background:'none', border:'none',
                  color: activeTab === tab ? 'var(--text)' : 'var(--text3)',
                  borderBottom: activeTab === tab ? '2px solid var(--accent)' : '2px solid transparent',
                  cursor:'pointer', fontSize:'14px', fontWeight: activeTab === tab ? 600 : 400
                }}>
                  {tab === 'posts' ? `📝 Пости (${posts.length})` : `👤 Люди (${users.length})`}
                </button>
              ))}
            </div>
          )}
        </div>

        <div style={{maxWidth:'580px', margin:'0 auto', padding: query.trim() ? '130px 16px 90px' : '70px 16px 90px'}}>
          {loading ? (
            <div style={{display:'flex', justifyContent:'center', marginTop:'60px'}}>
              <div style={{width:'32px', height:'32px', borderRadius:'50%', border:'3px solid #222', borderTop:'3px solid #7c3aed', animation:'spin 0.8s linear infinite'}}/>
              <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
            </div>
          ) : !query.trim() ? (
            <>
              <p style={{fontSize:'15px', fontWeight:600, marginBottom:'16px', color:'var(--text)'}}>🔥 В тренді</p>
              {trending.map((item, i) => (
                <div key={i} onClick={() => handleSearch(item.tag)} style={{
                  display:'flex', alignItems:'center', justifyContent:'space-between',
                  padding:'14px 0', borderBottom:'1px solid var(--border)', cursor:'pointer'
                }}>
                  <div style={{display:'flex', alignItems:'center', gap:'12px'}}>
                    <div style={{
                      width:'42px', height:'42px', borderRadius:'10px',
                      background:'var(--bg3)', display:'flex', alignItems:'center',
                      justifyContent:'center', color:'var(--text3)', fontSize:'16px', fontWeight:700
                    }}>#</div>
                    <div>
                      <p style={{fontSize:'14px', fontWeight:600, color:'var(--text)'}}>#{item.tag}</p>
                      <p style={{fontSize:'12px', color:'var(--text3)', marginTop:'2px'}}>{item.posts}</p>
                    </div>
                  </div>
                  <span style={{color:'var(--text3)', fontSize:'18px'}}>›</span>
                </div>
              ))}
            </>
          ) : activeTab === 'users' ? (
            users.length === 0 ? (
              <div style={{textAlign:'center', color:'var(--text3)', marginTop:'60px'}}>
                <p style={{fontSize:'32px', marginBottom:'12px'}}>👤</p>
                <p style={{fontSize:'14px'}}>Нікого не знайдено</p>
              </div>
            ) : users.map((user, i) => (
              <div key={user.id}
                className={`animate-fade-up delay-${Math.min(i+1,5)}`}
                onClick={() => router.push(`/user/${user.id}`)}
                style={{
                  display:'flex', alignItems:'center', gap:'14px',
                  padding:'14px 0', borderBottom:'1px solid var(--border)', cursor:'pointer'
                }}>
                <div style={{
                  width:'48px', height:'48px', borderRadius:'50%', flexShrink:0,
                  background:'linear-gradient(135deg, #7c3aed, #ec4899)',
                  display:'flex', alignItems:'center', justifyContent:'center',
                  fontSize:'18px', fontWeight:700, color:'#fff', overflow:'hidden'
                }}>
                  {user.avatar_url ? (
                    <img src={user.avatar_url} style={{width:'100%', height:'100%', objectFit:'cover'}}/>
                  ) : user.username?.[0]?.toUpperCase() || '?'}
                </div>
                <div style={{flex:1}}>
                  <p style={{fontWeight:600, fontSize:'14px', color:'var(--text)'}}>{user.username}</p>
                  <p style={{fontSize:'12px', color:'var(--text3)', marginTop:'2px'}}>
                    {user.city ? `🇺🇦 ${user.city}` : '🇺🇦 Україна'}
                  </p>
                </div>
                <span style={{color:'var(--text3)', fontSize:'18px'}}>›</span>
              </div>
            ))
          ) : (
            posts.length === 0 ? (
              <div style={{textAlign:'center', color:'var(--text3)', marginTop:'60px'}}>
                <p style={{fontSize:'32px', marginBottom:'12px'}}>🔍</p>
                <p style={{fontSize:'14px'}}>Нічого не знайдено</p>
              </div>
            ) : posts.map((post, i) => (
              <div key={post.id}
                className={`post animate-fade-up delay-${Math.min(i+1,5)}`}
                style={{cursor:'pointer'}}
                onClick={() => router.push(`/post/${post.id}`)}>
                <div className="post-header">
                  <div style={{
                    width:'38px', height:'38px', borderRadius:'50%', flexShrink:0,
                    background:'linear-gradient(135deg, #7c3aed, #ec4899)',
                    display:'flex', alignItems:'center', justifyContent:'center',
                    fontSize:'16px', fontWeight:700, color:'#fff', overflow:'hidden'
                  }}>
                    {post.profiles?.avatar_url ? (
                      <img src={post.profiles.avatar_url} style={{width:'100%', height:'100%', objectFit:'cover'}}/>
                    ) : post.profiles?.username?.[0]?.toUpperCase() || '?'}
                  </div>
                  <div>
                    <p className="username"
                      onClick={e => { e.stopPropagation(); router.push(`/user/${post.user_id}`) }}>
                      {post.profiles?.username || 'user'}
                    </p>
                    <span style={{fontSize:'11px', color:'var(--accent)'}}>{post.sub}</span>
                  </div>
                </div>
                <p className="post-text">{post.text}</p>
              </div>
            ))
          )}
        </div>
      </main>
    </PageTransition>
  )
}
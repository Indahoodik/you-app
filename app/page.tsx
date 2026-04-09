'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import PageTransition from './components/PageTransition'
import { supabase } from './lib/supabase'

const rooms = [
  { id: 'games', label: '🎮 Ігри', subcategories: ['Всі', 'Dota 2', 'CS2', 'Valorant', 'FIFA', 'Minecraft'] },
  { id: 'films', label: '🎬 Фільми', subcategories: ['Всі', 'Бойовики', 'Драми', 'Жахи', 'Комедії', 'Аніме'] },
  { id: 'music', label: '🎵 Музика', subcategories: ['Всі', 'Українська', 'Rock', 'Hip-Hop', 'Electronic', 'Pop'] },
  { id: 'sport', label: '⚽ Спорт', subcategories: ['Всі', 'Футбол', 'Бокс', 'Баскетбол', 'Теніс', 'UFC'] },
  { id: 'tech', label: '💻 Технології', subcategories: ['Всі', 'AI', 'Стартапи', 'Гаджети', 'Програмування', 'Крипто'] },
]

const gradients = ['avatar-gradient-1', 'avatar-gradient-2', 'avatar-gradient-3', 'avatar-gradient-4', 'avatar-gradient-5']

export default function Home() {
  const router = useRouter()
  const [activeRoom, setActiveRoom] = useState('games')
  const [activeSub, setActiveSub] = useState('Всі')
  const [posts, setPosts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set())

  const currentRoom = rooms.find(r => r.id === activeRoom)!

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setUserId(session.user.id)
    })
  }, [])

  useEffect(() => {
    fetchPosts()
  }, [activeRoom, activeSub])

  useEffect(() => {
    if (userId) fetchLikes()
  }, [userId])

  const fetchPosts = async () => {
    setLoading(true)
    let query = supabase
      .from('posts')
      .select('*, profiles(username)')
      .eq('room', activeRoom)
      .order('created_at', { ascending: false })

    if (activeSub !== 'Всі') query = query.eq('sub', activeSub)

    const { data } = await query
    setPosts(data || [])
    setLoading(false)
  }

  const fetchLikes = async () => {
    if (!userId) return
    const { data } = await supabase
      .from('likes')
      .select('post_id')
      .eq('user_id', userId)
    if (data) setLikedPosts(new Set(data.map((l: any) => l.post_id)))
  }

  const handleLike = async (e: React.MouseEvent, post: any) => {
    e.stopPropagation()
    if (!userId) return

    const isLiked = likedPosts.has(post.id)

    if (isLiked) {
      await supabase.from('likes').delete().eq('post_id', post.id).eq('user_id', userId)
      await supabase.from('posts').update({ likes: post.likes - 1 }).eq('id', post.id)
      setLikedPosts(prev => { const s = new Set(prev); s.delete(post.id); return s })
      setPosts(prev => prev.map(p => p.id === post.id ? {...p, likes: p.likes - 1} : p))
    } else {
      await supabase.from('likes').insert({ post_id: post.id, user_id: userId })
      await supabase.from('posts').update({ likes: post.likes + 1 }).eq('id', post.id)
      setLikedPosts(prev => new Set([...prev, post.id]))
      setPosts(prev => prev.map(p => p.id === post.id ? {...p, likes: p.likes + 1} : p))
    }
  }

  const timeAgo = (date: string) => {
    const diff = Date.now() - new Date(date + 'Z').getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 1) return 'щойно'
    if (mins < 60) return `${mins}хв тому`
    const hours = Math.floor(mins / 60)
    if (hours < 24) return `${hours}год тому`
    return `${Math.floor(hours / 24)}д тому`
  }

  return (
    <PageTransition>
      <main>
        <div className="header">
          <div className="header-top">
            <span className="logo">YOU</span>
            <button style={{background:'none', border:'none', color:'var(--text)', fontSize:'20px', cursor:'pointer'}}>🔔</button>
          </div>
          <div className="header-rooms">
            {rooms.map(room => (
              <button key={room.id} className={`room-btn ${activeRoom === room.id ? 'active' : ''}`}
                onClick={() => { setActiveRoom(room.id); setActiveSub('Всі') }}>
                {room.label}
              </button>
            ))}
          </div>
          <div className="header-rooms" style={{paddingTop:'0', paddingBottom:'10px'}}>
            {currentRoom.subcategories.map(sub => (
              <button key={sub} onClick={() => setActiveSub(sub)} style={{
                whiteSpace:'nowrap', padding:'4px 12px', borderRadius:'999px',
                background: activeSub === sub ? '#ffffff15' : 'none',
                color: activeSub === sub ? 'var(--text)' : 'var(--text3)',
                fontSize:'13px',
                border: activeSub === sub ? '1px solid #444' : '1px solid transparent',
                cursor:'pointer',
              }}>{sub}</button>
            ))}
          </div>
        </div>

        <div className="feed" style={{paddingTop:'140px', paddingBottom:'90px'}}>
          {loading ? (
            <div style={{display:'flex', justifyContent:'center', marginTop:'60px'}}>
              <div style={{
                width:'32px', height:'32px', borderRadius:'50%',
                border:'3px solid #222', borderTop:'3px solid #7c3aed',
                animation:'spin 0.8s linear infinite'
              }}/>
              <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
            </div>
          ) : posts.length === 0 ? (
            <div style={{textAlign:'center', color:'var(--text3)', marginTop:'60px'}}>
              <p style={{fontSize:'32px', marginBottom:'12px'}}>✍️</p>
              <p style={{fontSize:'14px'}}>Постів поки немає</p>
              <p style={{marginTop:'4px', fontSize:'12px'}}>Будь першим хто напише!</p>
              <button onClick={() => router.push('/create')} style={{
                marginTop:'16px', padding:'10px 20px', borderRadius:'999px',
                background:'var(--accent)', border:'none', color:'#fff',
                fontSize:'14px', cursor:'pointer'
              }}>Написати пост</button>
            </div>
          ) : posts.map((post, i) => (
            <div key={post.id} className={`post animate-fade-up delay-${Math.min(i+1,5)}`}
              style={{cursor:'pointer'}} onClick={() => router.push(`/post/${post.id}`)}>
              <div className="post-header">
                <div className={`avatar ${gradients[i % 5]}`} />
                <div>
                  <p className="username">{post.profiles?.username || 'user'}</p>
                  <div style={{display:'flex', alignItems:'center', gap:'6px'}}>
                    <p className="time">{timeAgo(post.created_at)}</p>
                    <span style={{color:'var(--text3)', fontSize:'11px'}}>·</span>
                    <span style={{fontSize:'11px', color:'var(--accent)'}}>{post.sub}</span>
                  </div>
                </div>
              </div>
              <p className="post-text">{post.text}</p>
              <div className="post-actions">
                <button className="action-btn"
                  onClick={e => handleLike(e, post)}
                  style={{color: likedPosts.has(post.id) ? '#ec4899' : 'var(--text3)'}}>
                  {likedPosts.has(post.id) ? '❤️' : '🤍'} {post.likes}
                </button>
                <button className="action-btn" onClick={e => { e.stopPropagation(); router.push(`/post/${post.id}`) }}>
                  💬 {post.comments_count || 0}
                </button>
                <button className="action-btn" onClick={e => e.stopPropagation()}>🔁 Поділитись</button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </PageTransition>
  )
}
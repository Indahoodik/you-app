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
  const [likeCounts, setLikeCounts] = useState<Record<string, number>>({})
  const [unreadCount, setUnreadCount] = useState(0)

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
    if (userId) {
      fetchLikes()
      fetchUnreadNotifications()

      const channel = supabase
        .channel('notifications')
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`
        }, () => {
          setUnreadCount(prev => prev + 1)
        })
        .subscribe()

      return () => { supabase.removeChannel(channel) }
    }
  }, [userId])

  const fetchUnreadNotifications = async () => {
    const { count } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('read', false)
    setUnreadCount(count || 0)
  }

  const fetchPosts = async () => {
    setLoading(true)
    let query = supabase
      .from('posts')
      .select('*, profiles(username, avatar_url)')
      .eq('room', activeRoom)
      .order('created_at', { ascending: false })

    if (activeSub !== 'Всі') query = query.eq('sub', activeSub)

    const { data } = await query
    const postsData = data || []
    setPosts(postsData)

    if (postsData.length > 0) {
      const ids = postsData.map((p: any) => p.id)
      const { data: likesData } = await supabase
        .from('likes')
        .select('post_id')
        .in('post_id', ids)
      const counts: Record<string, number> = {}
      ids.forEach((id: string) => counts[id] = 0)
      likesData?.forEach((l: any) => {
        counts[l.post_id] = (counts[l.post_id] || 0) + 1
      })
      setLikeCounts(counts)
    }
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
      setLikedPosts(prev => { const s = new Set(prev); s.delete(post.id); return s })
      setLikeCounts(prev => ({ ...prev, [post.id]: Math.max((prev[post.id] || 1) - 1, 0) }))
    } else {
      await supabase.from('likes').insert({ post_id: post.id, user_id: userId })
      setLikedPosts(prev => new Set([...prev, post.id]))
      setLikeCounts(prev => ({ ...prev, [post.id]: (prev[post.id] || 0) + 1 }))

      if (post.user_id !== userId) {
        await supabase.from('notifications').insert({
          user_id: post.user_id,
          actor_id: userId,
          type: 'like',
          post_id: post.id,
        })
      }
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
            <button
              onClick={() => router.push('/notifications')}
              style={{background:'none', border:'none', color:'var(--text)', fontSize:'20px', cursor:'pointer', position:'relative'}}>
              🔔
              {unreadCount > 0 && (
                <span style={{
                  position:'absolute', top:'-4px', right:'-4px',
                  width:'18px', height:'18px', borderRadius:'50%',
                  background:'#ef4444', fontSize:'10px', fontWeight:700,
                  color:'#fff', display:'flex', alignItems:'center', justifyContent:'center'
                }}>{unreadCount > 9 ? '9+' : unreadCount}</span>
              )}
            </button>
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
              <div style={{width:'32px', height:'32px', borderRadius:'50%', border:'3px solid #222', borderTop:'3px solid #7c3aed', animation:'spin 0.8s linear infinite'}}/>
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
                <div
                  onClick={e => { e.stopPropagation(); router.push(`/user/${post.user_id}`) }}
                  style={{
                    width:'38px', height:'38px', borderRadius:'50%', flexShrink:0,
                    background:'linear-gradient(135deg, #7c3aed, #ec4899)',
                    display:'flex', alignItems:'center', justifyContent:'center',
                    fontSize:'16px', fontWeight:700, color:'#fff', overflow:'hidden', cursor:'pointer'
                  }}>
                  {post.profiles?.avatar_url ? (
                    <img src={post.profiles.avatar_url} style={{width:'100%', height:'100%', objectFit:'cover'}}/>
                  ) : post.profiles?.username?.[0]?.toUpperCase() || '?'}
                </div>
                <div>
                  <p className="username" style={{cursor:'pointer'}}
                    onClick={e => { e.stopPropagation(); router.push(`/user/${post.user_id}`) }}>
                    {post.profiles?.username || 'user'}
                  </p>
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
                  {likedPosts.has(post.id) ? '❤️' : '🤍'} {likeCounts[post.id] || 0}
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
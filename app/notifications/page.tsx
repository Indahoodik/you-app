'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import PageTransition from '../components/PageTransition'
import { supabase } from '../lib/supabase'

export default function NotificationsPage() {
  const router = useRouter()
  const [notifications, setNotifications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) fetchNotifications(session.user.id)
    })
  }, [])

  const fetchNotifications = async (uid: string) => {
    const { data } = await supabase
      .from('notifications')
      .select('*, actor:actor_id(id, username, avatar_url), post:post_id(text)')
      .eq('user_id', uid)
      .order('created_at', { ascending: false })
      .limit(50)

    setNotifications(data || [])
    setLoading(false)

    await supabase
      .from('notifications')
      .update({ read: true })
      .eq('user_id', uid)
      .eq('read', false)
  }

  const getText = (n: any) => {
    switch (n.type) {
      case 'like': return 'лайкнув твій пост ❤️'
      case 'comment': return 'прокоментував твій пост 💬'
      case 'follow': return 'підписався на тебе 👤'
      default: return 'зробив щось'
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
        <div style={{
          position:'fixed', top:0, left:0, right:0, zIndex:100,
          background:'var(--bg)', borderBottom:'1px solid var(--border)',
          display:'flex', alignItems:'center', gap:'12px', padding:'14px 16px'
        }}>
          <button onClick={() => router.back()} style={{background:'none', border:'none', color:'var(--text)', fontSize:'20px', cursor:'pointer'}}>←</button>
          <span style={{fontWeight:600, fontSize:'16px', color:'var(--text)'}}>Сповіщення</span>
        </div>

        <div style={{maxWidth:'580px', margin:'0 auto', padding:'70px 16px 90px'}}>
          {loading ? (
            <div style={{display:'flex', justifyContent:'center', marginTop:'60px'}}>
              <div style={{width:'32px', height:'32px', borderRadius:'50%', border:'3px solid #222', borderTop:'3px solid #7c3aed', animation:'spin 0.8s linear infinite'}}/>
              <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
            </div>
          ) : notifications.length === 0 ? (
            <div style={{textAlign:'center', color:'var(--text3)', marginTop:'80px'}}>
              <p style={{fontSize:'32px', marginBottom:'12px'}}>🔔</p>
              <p style={{fontSize:'14px'}}>Сповіщень поки немає</p>
            </div>
          ) : notifications.map((n, i) => (
            <div
              key={n.id}
              className={`animate-fade-up delay-${Math.min(i+1,5)}`}
              onClick={() => n.post_id ? router.push(`/post/${n.post_id}`) : router.push(`/user/${n.actor?.id}`)}
              style={{
                display:'flex', alignItems:'center', gap:'14px',
                paddingTop:'14px', paddingBottom:'14px',
                paddingLeft: n.read ? '0' : '16px',
                paddingRight: n.read ? '0' : '16px',
                borderBottom:'1px solid var(--border)',
                cursor:'pointer',
                background: n.read ? 'none' : 'var(--bg2)',
                margin: n.read ? '0' : '0 -16px',
              }}
            >
              <div
                onClick={e => { e.stopPropagation(); router.push(`/user/${n.actor?.id}`) }}
                style={{
                  width:'44px', height:'44px', borderRadius:'50%', flexShrink:0,
                  background:'linear-gradient(135deg, #7c3aed, #ec4899)',
                  display:'flex', alignItems:'center', justifyContent:'center',
                  fontSize:'16px', fontWeight:700, color:'#fff', overflow:'hidden', cursor:'pointer'
                }}
              >
                {n.actor?.avatar_url ? (
                  <img src={n.actor.avatar_url} style={{width:'100%', height:'100%', objectFit:'cover'}}/>
                ) : n.actor?.username?.[0]?.toUpperCase() || '?'}
              </div>
              <div style={{flex:1, minWidth:0}}>
                <p style={{fontSize:'14px', color:'var(--text)', lineHeight:'1.4'}}>
                  <span style={{fontWeight:600}}>{n.actor?.username}</span>
                  {' '}{getText(n)}
                </p>
                {n.post?.text && (
                  <p style={{
                    fontSize:'12px', color:'var(--text3)', marginTop:'4px',
                    overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'
                  }}>{n.post.text}</p>
                )}
                <p style={{fontSize:'11px', color:'var(--text3)', marginTop:'4px'}}>{timeAgo(n.created_at)}</p>
              </div>
              {!n.read && (
                <div style={{width:'8px', height:'8px', borderRadius:'50%', background:'var(--accent)', flexShrink:0}}/>
              )}
            </div>
          ))}
        </div>
      </main>
    </PageTransition>
  )
}
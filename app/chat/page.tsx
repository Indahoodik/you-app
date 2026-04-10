'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import PageTransition from '../components/PageTransition'
import { supabase } from '../lib/supabase'

export default function ChatPage() {
  const router = useRouter()
  const [chats, setChats] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setUserId(session.user.id)
        fetchChats(session.user.id)
      }
    })
  }, [])

  const fetchChats = async (uid: string) => {
    const { data } = await supabase
      .from('messages')
      .select('*, sender:sender_id(id, username, avatar_url), receiver:receiver_id(id, username, avatar_url)')
      .or(`sender_id.eq.${uid},receiver_id.eq.${uid}`)
      .order('created_at', { ascending: false })

    if (!data) { setLoading(false); return }

    const seen = new Set<string>()
    const unique: any[] = []

    for (const msg of data) {
      const otherId = msg.sender_id === uid ? msg.receiver_id : msg.sender_id
      if (!seen.has(otherId)) {
        seen.add(otherId)
        const other = msg.sender_id === uid ? msg.receiver : msg.sender
        unique.push({ ...msg, other, unread: !msg.read && msg.receiver_id === uid })
      }
    }

    setChats(unique)
    setLoading(false)
  }

  const timeAgo = (date: string) => {
    const diff = Date.now() - new Date(date + 'Z').getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 1) return 'щойно'
    if (mins < 60) return `${mins}хв`
    const hours = Math.floor(mins / 60)
    if (hours < 24) return `${hours}год`
    return `${Math.floor(hours / 24)}д`
  }

  return (
    <PageTransition>
      <main>
        <div style={{
          position:'fixed', top:0, left:0, right:0, zIndex:100,
          background:'var(--bg)', borderBottom:'1px solid var(--border)',
          display:'flex', alignItems:'center', justifyContent:'space-between',
          padding:'14px 16px'
        }}>
          <span style={{fontWeight:700, fontSize:'18px', color:'var(--text)'}}>Повідомлення</span>
        </div>

        <div style={{maxWidth:'580px', margin:'0 auto', padding:'70px 16px 90px'}}>
          {loading ? (
            <div style={{display:'flex', justifyContent:'center', marginTop:'60px'}}>
              <div style={{width:'32px', height:'32px', borderRadius:'50%', border:'3px solid #222', borderTop:'3px solid #7c3aed', animation:'spin 0.8s linear infinite'}}/>
              <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
            </div>
          ) : chats.length === 0 ? (
            <div style={{textAlign:'center', color:'var(--text3)', marginTop:'80px'}}>
              <p style={{fontSize:'32px', marginBottom:'12px'}}>💬</p>
              <p style={{fontSize:'14px'}}>Повідомлень поки немає</p>
              <p style={{fontSize:'12px', marginTop:'4px'}}>Знайди когось цікавого і напиши першим!</p>
            </div>
          ) : chats.map((chat, i) => (
            <div key={chat.id} className={`animate-fade-up delay-${Math.min(i+1,5)}`}
              onClick={() => router.push(`/chat/${chat.other?.id}`)}
              style={{
                display:'flex', alignItems:'center', gap:'14px',
                padding:'14px 0', borderBottom:'1px solid var(--border)', cursor:'pointer'
              }}>
              <div style={{position:'relative'}}>
                <div style={{
                  width:'48px', height:'48px', borderRadius:'50%',
                  background:'linear-gradient(135deg, #7c3aed, #ec4899)',
                  display:'flex', alignItems:'center', justifyContent:'center',
                  fontSize:'18px', fontWeight:700, color:'#fff', overflow:'hidden', flexShrink:0
                }}>
                  {chat.other?.avatar_url ? (
                    <img src={chat.other.avatar_url} style={{width:'100%', height:'100%', objectFit:'cover'}}/>
                  ) : chat.other?.username?.[0]?.toUpperCase() || '?'}
                </div>
                {chat.unread && (
                  <div style={{
                    position:'absolute', top:0, right:0,
                    width:'12px', height:'12px', borderRadius:'50%',
                    background:'var(--accent)', border:'2px solid var(--bg)'
                  }}/>
                )}
              </div>
              <div style={{flex:1, minWidth:0}}>
                <div style={{display:'flex', justifyContent:'space-between', marginBottom:'4px'}}>
                  <p style={{fontWeight:600, fontSize:'14px', color:'var(--text)'}}>{chat.other?.username || 'user'}</p>
                  <p style={{fontSize:'12px', color:'var(--text3)'}}>{timeAgo(chat.created_at)}</p>
                </div>
                <p style={{
                  fontSize:'13px',
                  color: chat.unread ? 'var(--text)' : 'var(--text3)',
                  fontWeight: chat.unread ? 600 : 400,
                  overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'
                }}>{chat.text}</p>
              </div>
            </div>
          ))}
        </div>
      </main>
    </PageTransition>
  )
}
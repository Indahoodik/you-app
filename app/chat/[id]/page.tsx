'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { supabase } from '../../lib/supabase'

export default function ConversationPage() {
  const router = useRouter()
  const params = useParams()
  const otherId = params?.id as string
  const bottomRef = useRef<HTMLDivElement>(null)

  const [messages, setMessages] = useState<any[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [userId, setUserId] = useState<string | null>(null)
  const [otherProfile, setOtherProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setUserId(session.user.id)
    })
  }, [])

  useEffect(() => {
    if (otherId) fetchOtherProfile()
  }, [otherId])

  useEffect(() => {
    if (!userId || !otherId) return

    fetchMessages()

    const channel = supabase
      .channel(`chat_${[userId, otherId].sort().join('_')}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
      }, async payload => {
        const msg = payload.new as any
        if (
          (msg.sender_id === userId && msg.receiver_id === otherId) ||
          (msg.sender_id === otherId && msg.receiver_id === userId)
        ) {
          setMessages(prev => [...prev, msg])
          setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100)

          if (msg.sender_id === otherId) {
            await supabase.from('messages').update({ read: true }).eq('id', msg.id)
            setMessages(prev => prev.map(m => m.id === msg.id ? {...m, read: true} : m))
          }
        }
      })
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'messages',
      }, payload => {
        const msg = payload.new as any
        setMessages(prev => prev.map(m => m.id === msg.id ? {...m, read: msg.read} : m))
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [userId, otherId])

  const fetchOtherProfile = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', otherId)
      .single()
    setOtherProfile(data)
  }

  const fetchMessages = async () => {
    const { data } = await supabase
      .from('messages')
      .select('*')
      .or(`and(sender_id.eq.${userId},receiver_id.eq.${otherId}),and(sender_id.eq.${otherId},receiver_id.eq.${userId})`)
      .order('created_at', { ascending: true })
    setMessages(data || [])
    setLoading(false)
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100)

    await supabase
      .from('messages')
      .update({ read: true })
      .eq('sender_id', otherId)
      .eq('receiver_id', userId)
      .eq('read', false)
  }

  const handleSend = async () => {
    if (!newMessage.trim() || !userId) return
    const text = newMessage.trim()
    setNewMessage('')
    const { data } = await supabase.from('messages').insert({
      sender_id: userId,
      receiver_id: otherId,
      text,
      read: false,
    }).select().single()

    if (data) {
      setMessages(prev => [...prev, data])
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100)
    }
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

  const Checkmarks = ({ msg }: { msg: any }) => {
    if (msg.sender_id !== userId) return null
    return (
      <span style={{fontSize:'11px', marginLeft:'4px'}}>
        {msg.read ? (
          <span style={{color:'#60a5fa'}}>✓✓</span>
        ) : (
          <span style={{color:'rgba(255,255,255,0.5)'}}>✓</span>
        )}
      </span>
    )
  }

  return (
    <main style={{background:'var(--bg)', minHeight:'100vh'}}>
      <div style={{
        position:'fixed', top:0, left:0, right:0, zIndex:100,
        background:'var(--bg)', borderBottom:'1px solid var(--border)',
        display:'flex', alignItems:'center', gap:'12px', padding:'12px 16px'
      }}>
        <button onClick={() => router.back()} style={{background:'none', border:'none', color:'var(--text)', fontSize:'20px', cursor:'pointer'}}>←</button>
        <div style={{
          width:'36px', height:'36px', borderRadius:'50%',
          background:'linear-gradient(135deg, #7c3aed, #ec4899)',
          display:'flex', alignItems:'center', justifyContent:'center',
          fontSize:'14px', fontWeight:700, color:'#fff', overflow:'hidden', flexShrink:0
        }}>
          {otherProfile?.avatar_url ? (
            <img src={otherProfile.avatar_url} style={{width:'100%', height:'100%', objectFit:'cover'}}/>
          ) : otherProfile?.username?.[0]?.toUpperCase() || '?'}
        </div>
        <div>
          <p style={{fontWeight:600, fontSize:'15px', color:'var(--text)', margin:0}}>
            {otherProfile?.username || 'user'}
          </p>
        </div>
      </div>

      <div style={{
        maxWidth:'580px', margin:'0 auto',
        padding:'70px 16px 100px',
        display:'flex', flexDirection:'column', gap:'8px'
      }}>
        {loading ? (
          <div style={{display:'flex', justifyContent:'center', marginTop:'60px'}}>
            <div style={{width:'32px', height:'32px', borderRadius:'50%', border:'3px solid #222', borderTop:'3px solid #7c3aed', animation:'spin 0.8s linear infinite'}}/>
            <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
          </div>
        ) : messages.length === 0 ? (
          <div style={{textAlign:'center', color:'var(--text3)', marginTop:'80px'}}>
            <p style={{fontSize:'32px', marginBottom:'12px'}}>👋</p>
            <p style={{fontSize:'14px'}}>Напиши першим!</p>
          </div>
        ) : messages.map(msg => {
          const isMine = msg.sender_id === userId
          return (
            <div key={msg.id} style={{display:'flex', justifyContent: isMine ? 'flex-end' : 'flex-start'}}>
              <div style={{
                maxWidth:'72%', padding:'10px 14px',
                borderRadius: isMine ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                background: isMine ? 'var(--accent)' : 'var(--bg2)',
                border: isMine ? 'none' : '1px solid var(--border)',
              }}>
                <p style={{fontSize:'14px', color: isMine ? '#fff' : 'var(--text)', lineHeight:'1.4', margin:0}}>
                  {msg.text}
                </p>
                <div style={{display:'flex', alignItems:'center', justifyContent:'flex-end', gap:'2px', marginTop:'4px'}}>
                  <p style={{fontSize:'10px', color: isMine ? 'rgba(255,255,255,0.6)' : 'var(--text3)', margin:0}}>
                    {timeAgo(msg.created_at)}
                  </p>
                  <Checkmarks msg={msg}/>
                </div>
              </div>
            </div>
          )
        })}
        <div ref={bottomRef}/>
      </div>

      <div style={{
        position:'fixed', bottom:0, left:0, right:0, zIndex:200,
        background:'var(--bg)', borderTop:'1px solid var(--border)',
        padding:'12px 16px 32px', display:'flex', gap:'10px', alignItems:'center'
      }}>
        <input
          value={newMessage}
          onChange={e => setNewMessage(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSend()}
          placeholder="Повідомлення..."
          style={{
            flex:1, background:'var(--bg3)', border:'1px solid var(--border)',
            borderRadius:'999px', padding:'10px 16px',
            color:'var(--text)', fontSize:'14px', outline:'none', fontFamily:'inherit'
          }}
        />
        <button onClick={handleSend} style={{
          background:'var(--accent)', border:'none', borderRadius:'50%',
          width:'40px', height:'40px', color:'#fff', fontSize:'18px',
          cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center',
          flexShrink:0
        }}>↑</button>
      </div>
    </main>
  )
}
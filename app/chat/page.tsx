'use client'
import { useRouter } from 'next/navigation'
import PageTransition from '../components/PageTransition'

const chats = [
  { user: 'cs_pro', text: 'Йдеш на турнір?', time: '5хв', unread: 2, gradient: 'avatar-gradient-2' },
  { user: 'dj_kyiv', text: 'Слухай той трек що я скинув', time: '1год', unread: 0, gradient: 'avatar-gradient-1' },
  { user: 'boxing_ua', text: 'Бачив матч вчора?? 🔥', time: '2год', unread: 5, gradient: 'avatar-gradient-3' },
  { user: 'dev_ua', text: 'Можеш глянути мій код?', time: '3год', unread: 0, gradient: 'avatar-gradient-4' },
  { user: 'cinema_ua', text: 'Ідемо в кіно в суботу', time: 'вчора', unread: 1, gradient: 'avatar-gradient-5' },
]

export default function ChatPage() {
  const router = useRouter()

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
          <button style={{background:'none', border:'none', color:'var(--accent)', fontSize:'22px', cursor:'pointer'}}>✏️</button>
        </div>

        <div style={{maxWidth:'580px', margin:'0 auto', padding:'70px 16px 90px'}}>
          {chats.map((chat, i) => (
            <div key={i} className={`animate-fade-up delay-${Math.min(i+1,5)}`} style={{
              display:'flex', alignItems:'center', gap:'14px',
              padding:'14px 0', borderBottom:'1px solid var(--border)', cursor:'pointer'
            }}>
              <div style={{position:'relative'}}>
                <div className={`avatar ${chat.gradient}`} style={{width:'48px', height:'48px'}}/>
                {chat.unread > 0 && (
                  <div style={{
                    position:'absolute', top:0, right:0,
                    width:'18px', height:'18px', borderRadius:'50%',
                    background:'var(--accent)', display:'flex',
                    alignItems:'center', justifyContent:'center',
                    fontSize:'10px', fontWeight:700, color:'#fff'
                  }}>{chat.unread}</div>
                )}
              </div>
              <div style={{flex:1, minWidth:0}}>
                <div style={{display:'flex', justifyContent:'space-between', marginBottom:'4px'}}>
                  <p style={{fontWeight:600, fontSize:'14px', color:'var(--text)'}}>{chat.user}</p>
                  <p style={{fontSize:'12px', color:'var(--text3)'}}>{chat.time}</p>
                </div>
                <p style={{
                  fontSize:'13px',
                  color: chat.unread > 0 ? 'var(--text)' : 'var(--text3)',
                  fontWeight: chat.unread > 0 ? 500 : 400,
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
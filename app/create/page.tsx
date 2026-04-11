'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import PageTransition from '../components/PageTransition'
import { supabase } from '../lib/supabase'

const rooms = [
  { id: 'games', label: '🎮 Ігри', subs: ['Dota 2', 'CS2', 'Valorant', 'FIFA', 'Minecraft'] },
  { id: 'films', label: '🎬 Фільми', subs: ['Бойовики', 'Драми', 'Жахи', 'Комедії', 'Аніме'] },
  { id: 'music', label: '🎵 Музика', subs: ['Українська', 'Rock', 'Hip-Hop', 'Electronic', 'Pop'] },
  { id: 'sport', label: '⚽ Спорт', subs: ['Футбол', 'Бокс', 'Баскетбол', 'Теніс', 'UFC'] },
  { id: 'tech', label: '💻 Технології', subs: ['AI', 'Стартапи', 'Гаджети', 'Програмування', 'Крипто'] },
]

export default function CreatePage() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [text, setText] = useState('')
  const [selectedRoom, setSelectedRoom] = useState('')
  const [selectedSub, setSelectedSub] = useState('')
  const [loading, setLoading] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const [imageUrl, setImageUrl] = useState('')
  const [imagePreview, setImagePreview] = useState('')
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setUserId(session.user.id)
    })
  }, [])

  const currentRoom = rooms.find(r => r.id === selectedRoom)
  const canPost = text.trim().length > 0 && selectedRoom !== '' && selectedSub !== ''

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !userId) return
    setImagePreview(URL.createObjectURL(file))
    setUploading(true)
    const fileExt = file.name.split('.').pop()
    const filePath = `${userId}/${Date.now()}.${fileExt}`
    const { error } = await supabase.storage.from('posts').upload(filePath, file)
    if (!error) {
      const { data } = supabase.storage.from('posts').getPublicUrl(filePath)
      setImageUrl(data.publicUrl)
    }
    setUploading(false)
  }

  const handlePost = async () => {
    if (!canPost || !userId) return
    setLoading(true)
    const { error } = await supabase.from('posts').insert({
      user_id: userId,
      text: text.trim(),
      room: selectedRoom,
      sub: selectedSub,
      image_url: imageUrl || null,
    })
    if (!error) {
      router.push('/')
    } else {
      alert('Помилка: ' + JSON.stringify(error))
    }
    setLoading(false)
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
          <button onClick={() => router.back()} style={{background:'none', border:'none', color:'var(--text)', fontSize:'20px', cursor:'pointer'}}>✕</button>
          <span style={{fontWeight:600, fontSize:'16px', color:'var(--text)'}}>Новий пост</span>
          <button onClick={handlePost} disabled={!canPost || loading} style={{
            background: canPost ? 'var(--accent)' : 'var(--bg3)',
            border:'none', borderRadius:'999px', padding:'8px 18px',
            color: canPost ? '#fff' : 'var(--text3)',
            fontSize:'14px', fontWeight:600, cursor: canPost ? 'pointer' : 'default',
            transition:'all 0.2s'
          }}>{loading ? '...' : 'Опублікувати'}</button>
        </div>

        <div style={{maxWidth:'580px', margin:'0 auto', padding:'70px 16px 90px'}}>
          <div style={{display:'flex', gap:'12px', marginBottom:'16px'}}>
            <div style={{
              width:'42px', height:'42px', borderRadius:'50%', flexShrink:0,
              background:'linear-gradient(135deg, #7c3aed, #ec4899)'
            }}/>
            <textarea
              value={text}
              onChange={e => setText(e.target.value)}
              placeholder="Що хочеш сказати?"
              maxLength={500}
              style={{
                flex:1, background:'none', border:'none', color:'var(--text)',
                fontSize:'16px', lineHeight:'1.6', resize:'none',
                outline:'none', minHeight:'100px', fontFamily:'inherit'
              }}
            />
          </div>

          {imagePreview && (
            <div style={{position:'relative', marginBottom:'16px', borderRadius:'12px', overflow:'hidden'}}>
              <img src={imagePreview} style={{width:'100%', maxHeight:'300px', objectFit:'cover'}}/>
              <button
                onClick={() => { setImagePreview(''); setImageUrl('') }}
                style={{
                  position:'absolute', top:'8px', right:'8px',
                  background:'rgba(0,0,0,0.6)', border:'none', borderRadius:'50%',
                  width:'28px', height:'28px', color:'#fff', cursor:'pointer', fontSize:'14px'
                }}>✕</button>
              {uploading && (
                <div style={{
                  position:'absolute', inset:0, background:'rgba(0,0,0,0.5)',
                  display:'flex', alignItems:'center', justifyContent:'center'
                }}>
                  <div style={{width:'24px', height:'24px', borderRadius:'50%', border:'2px solid #fff', borderTop:'2px solid transparent', animation:'spin 0.8s linear infinite'}}/>
                  <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
                </div>
              )}
            </div>
          )}

          <div style={{display:'flex', gap:'12px', marginBottom:'24px', paddingBottom:'16px', borderBottom:'1px solid var(--border)'}}>
            <button
              onClick={() => fileInputRef.current?.click()}
              style={{
                display:'flex', alignItems:'center', gap:'6px',
                background:'none', border:'1px solid var(--border)',
                borderRadius:'999px', padding:'8px 14px',
                color:'var(--text2)', fontSize:'13px', cursor:'pointer'
              }}>
              🖼️ Фото
            </button>
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} style={{display:'none'}}/>
          </div>

          <div style={{textAlign:'right', color:'var(--text3)', fontSize:'12px', marginBottom:'24px'}}>{text.length}/500</div>

          <p style={{fontSize:'13px', color:'var(--text3)', marginBottom:'10px'}}>Оберіть комнату</p>
          <div style={{display:'flex', gap:'8px', flexWrap:'wrap', marginBottom:'20px'}}>
            {rooms.map(room => (
              <button key={room.id} onClick={() => { setSelectedRoom(room.id); setSelectedSub('') }} style={{
                padding:'8px 14px', borderRadius:'999px', fontSize:'13px', cursor:'pointer',
                background: selectedRoom === room.id ? 'var(--accent)' : 'var(--bg3)',
                color: selectedRoom === room.id ? '#fff' : 'var(--text2)',
                border: selectedRoom === room.id ? '1px solid var(--accent)' : '1px solid var(--border)',
                transition:'all 0.2s'
              }}>{room.label}</button>
            ))}
          </div>

          {currentRoom && (
            <>
              <p style={{fontSize:'13px', color:'var(--text3)', marginBottom:'10px'}}>Оберіть тему</p>
              <div style={{display:'flex', gap:'8px', flexWrap:'wrap'}}>
                {currentRoom.subs.map(sub => (
                  <button key={sub} onClick={() => setSelectedSub(sub)} style={{
                    padding:'8px 14px', borderRadius:'999px', fontSize:'13px', cursor:'pointer',
                    background: selectedSub === sub ? '#ffffff15' : 'none',
                    color: selectedSub === sub ? 'var(--text)' : 'var(--text3)',
                    border: selectedSub === sub ? '1px solid #444' : '1px solid var(--border)',
                    transition:'all 0.2s'
                  }}>{sub}</button>
                ))}
              </div>
            </>
          )}
        </div>
      </main>
    </PageTransition>
  )
}
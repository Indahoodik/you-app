'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import PageTransition from '../components/PageTransition'
import { supabase } from '../lib/supabase'

export default function EditProfilePage() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [username, setUsername] = useState('')
  const [bio, setBio] = useState('')
  const [city, setCity] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return
    setUserId(session.user.id)

    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single()

    if (data) {
      setUsername(data.username || '')
      setBio(data.bio || '')
      setCity(data.city || '')
      setAvatarUrl(data.avatar_url || '')
    }
  }

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !userId) return

    setUploading(true)
    const fileExt = file.name.split('.').pop()
    const filePath = `${userId}/avatar.${fileExt}`

    const { error } = await supabase.storage
      .from('avatars')
      .upload(filePath, file, { upsert: true })

    if (!error) {
      const { data } = supabase.storage.from('avatars').getPublicUrl(filePath)
      setAvatarUrl(data.publicUrl)
    }
    setUploading(false)
  }

  const handleSave = async () => {
    if (!userId) return
    if (username.trim().length < 3) { setError('Нікнейм мінімум 3 символи'); return }
    setSaving(true)
    setError('')

    const { data: existing } = await supabase
      .from('profiles')
      .select('id')
      .eq('username', username.trim())
      .neq('id', userId)
      .single()

    if (existing) { setError('Цей нікнейм вже зайнятий'); setSaving(false); return }

    const { error } = await supabase
      .from('profiles')
      .update({
        username: username.trim(),
        bio: bio.trim(),
        city: city.trim(),
        avatar_url: avatarUrl,
      })
      .eq('id', userId)

    if (!error) {
      router.push('/profile')
    } else {
      setError('Помилка збереження')
    }
    setSaving(false)
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
          <span style={{fontWeight:600, fontSize:'16px', color:'var(--text)'}}>Редагувати профіль</span>
          <button onClick={handleSave} disabled={saving} style={{
            background:'var(--accent)', border:'none', borderRadius:'999px',
            padding:'8px 18px', color:'#fff', fontSize:'14px',
            fontWeight:600, cursor:'pointer'
          }}>{saving ? '...' : 'Зберегти'}</button>
        </div>

        <div style={{maxWidth:'580px', margin:'0 auto', padding:'80px 16px 40px'}}>

          {/* Аватар */}
          <div style={{display:'flex', flexDirection:'column', alignItems:'center', marginBottom:'32px'}}>
            <div
              onClick={() => fileInputRef.current?.click()}
              style={{
                width:'90px', height:'90px', borderRadius:'50%', cursor:'pointer',
                background: avatarUrl ? 'none' : 'linear-gradient(135deg, #7c3aed, #ec4899)',
                display:'flex', alignItems:'center', justifyContent:'center',
                fontSize:'32px', fontWeight:700, color:'#fff',
                overflow:'hidden', position:'relative', marginBottom:'8px'
              }}
            >
              {avatarUrl ? (
                <img src={avatarUrl} style={{width:'100%', height:'100%', objectFit:'cover'}}/>
              ) : (
                username?.[0]?.toUpperCase() || '?'
              )}
              <div style={{
                position:'absolute', inset:0, background:'rgba(0,0,0,0.4)',
                display:'flex', alignItems:'center', justifyContent:'center',
                opacity:0, transition:'opacity 0.2s'
              }}
                onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
                onMouseLeave={e => (e.currentTarget.style.opacity = '0')}
              >
                <span style={{fontSize:'20px'}}>📷</span>
              </div>
            </div>
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleAvatarUpload} style={{display:'none'}}/>
            <p style={{fontSize:'13px', color:'var(--accent)', cursor:'pointer'}} onClick={() => fileInputRef.current?.click()}>
              {uploading ? 'Завантаження...' : 'Змінити фото'}
            </p>
          </div>

          {/* Поля */}
          <div style={{display:'flex', flexDirection:'column', gap:'16px'}}>
            <div>
              <p style={{fontSize:'12px', color:'var(--text3)', marginBottom:'6px'}}>Нікнейм</p>
              <input
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="твій_нік"
                style={{
                  width:'100%', padding:'12px 16px', borderRadius:'12px',
                  background:'var(--bg3)', border:'1px solid var(--border)',
                  color:'var(--text)', fontSize:'14px', outline:'none',
                  fontFamily:'inherit', boxSizing:'border-box'
                }}
              />
            </div>

            <div>
              <p style={{fontSize:'12px', color:'var(--text3)', marginBottom:'6px'}}>Біо</p>
              <textarea
                value={bio}
                onChange={e => setBio(e.target.value)}
                placeholder="Розкажи про себе..."
                maxLength={150}
                style={{
                  width:'100%', padding:'12px 16px', borderRadius:'12px',
                  background:'var(--bg3)', border:'1px solid var(--border)',
                  color:'var(--text)', fontSize:'14px', outline:'none',
                  fontFamily:'inherit', resize:'none', minHeight:'80px',
                  boxSizing:'border-box'
                }}
              />
              <p style={{fontSize:'11px', color:'var(--text3)', textAlign:'right', marginTop:'4px'}}>{bio.length}/150</p>
            </div>

            <div>
              <p style={{fontSize:'12px', color:'var(--text3)', marginBottom:'6px'}}>Місто</p>
              <input
                value={city}
                onChange={e => setCity(e.target.value)}
                placeholder="Київ"
                style={{
                  width:'100%', padding:'12px 16px', borderRadius:'12px',
                  background:'var(--bg3)', border:'1px solid var(--border)',
                  color:'var(--text)', fontSize:'14px', outline:'none',
                  fontFamily:'inherit', boxSizing:'border-box'
                }}
              />
            </div>

            {error && <p style={{color:'#ef4444', fontSize:'13px', textAlign:'center'}}>{error}</p>}
          </div>
        </div>
      </main>
    </PageTransition>
  )
}
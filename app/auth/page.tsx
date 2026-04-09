'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../lib/supabase'

export default function AuthPage() {
  const router = useRouter()
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [city, setCity] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async () => {
    setLoading(true)
    setError('')

    if (isLogin) {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) { setError(error.message); setLoading(false); return }
      router.push('/')
    } else {
      const { data, error } = await supabase.auth.signUp({ email, password })
      if (error) { setError(error.message); setLoading(false); return }

      if (data.user) {
        await supabase.from('profiles').insert({
          id: data.user.id,
          username,
          city,
        })
      }
      router.push('/')
    }
    setLoading(false)
  }

  return (
    <main style={{
      minHeight:'100vh', background:'var(--bg)',
      display:'flex', alignItems:'center', justifyContent:'center',
      padding:'20px'
    }}>
      <div style={{width:'100%', maxWidth:'400px'}}>

        <div style={{textAlign:'center', marginBottom:'40px'}}>
          <h1 style={{
            fontSize:'48px', fontWeight:800, letterSpacing:'-2px',
            background:'linear-gradient(135deg, #7c3aed, #a855f7)',
            WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent'
          }}>YOU</h1>
          <p style={{color:'var(--text3)', fontSize:'14px', marginTop:'8px'}}>
            Перша українська соцмережа
          </p>
        </div>

        <div style={{
          background:'var(--bg2)', border:'1px solid var(--border)',
          borderRadius:'20px', padding:'24px'
        }}>
          <div style={{display:'flex', marginBottom:'24px', background:'var(--bg3)', borderRadius:'12px', padding:'4px'}}>
            {['Увійти', 'Реєстрація'].map((tab, i) => (
              <button key={tab} onClick={() => { setIsLogin(i === 0); setError('') }} style={{
                flex:1, padding:'10px', borderRadius:'10px', border:'none', cursor:'pointer',
                background: isLogin === (i === 0) ? 'var(--accent)' : 'none',
                color: isLogin === (i === 0) ? '#fff' : 'var(--text3)',
                fontSize:'14px', fontWeight:600, transition:'all 0.2s'
              }}>{tab}</button>
            ))}
          </div>

          <div style={{display:'flex', flexDirection:'column', gap:'12px'}}>
            {!isLogin && (
              <input
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="Нікнейм (наприклад: kyiv_gamer)"
                style={{
                  padding:'12px 16px', borderRadius:'12px',
                  background:'var(--bg3)', border:'1px solid var(--border)',
                  color:'var(--text)', fontSize:'14px', outline:'none', fontFamily:'inherit'
                }}
              />
            )}

            <input
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="Email"
              type="email"
              style={{
                padding:'12px 16px', borderRadius:'12px',
                background:'var(--bg3)', border:'1px solid var(--border)',
                color:'var(--text)', fontSize:'14px', outline:'none', fontFamily:'inherit'
              }}
            />

            <input
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Пароль"
              type="password"
              style={{
                padding:'12px 16px', borderRadius:'12px',
                background:'var(--bg3)', border:'1px solid var(--border)',
                color:'var(--text)', fontSize:'14px', outline:'none', fontFamily:'inherit'
              }}
            />

            {!isLogin && (
              <input
                value={city}
                onChange={e => setCity(e.target.value)}
                placeholder="Місто (необов'язково)"
                style={{
                  padding:'12px 16px', borderRadius:'12px',
                  background:'var(--bg3)', border:'1px solid var(--border)',
                  color:'var(--text)', fontSize:'14px', outline:'none', fontFamily:'inherit'
                }}
              />
            )}

            {error && (
              <p style={{color:'#ef4444', fontSize:'13px', textAlign:'center'}}>{error}</p>
            )}

            <button
              onClick={handleSubmit}
              disabled={loading}
              style={{
                padding:'14px', borderRadius:'12px', border:'none',
                background: loading ? 'var(--bg3)' : 'var(--accent)',
                color: loading ? 'var(--text3)' : '#fff',
                fontSize:'15px', fontWeight:700, cursor: loading ? 'default' : 'pointer',
                transition:'all 0.2s', marginTop:'4px'
              }}
            >
              {loading ? 'Завантаження...' : isLogin ? 'Увійти' : 'Створити акаунт'}
            </button>
          </div>
        </div>
      </div>
    </main>
  )
}

'use client'
import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import BottomBar from './BottomBar'
import { supabase } from '../lib/supabase'

export default function AuthWrapper({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session && pathname !== '/auth') {
        router.push('/auth')
      }
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session && pathname !== '/auth') {
        router.push('/auth')
      }
    })

    return () => subscription.unsubscribe()
  }, [pathname])

  const isAuthPage = pathname === '/auth'

  if (loading) {
    return (
      <div style={{
        background:'#0a0a0a', display:'flex', alignItems:'center',
        justifyContent:'center', minHeight:'100vh'
      }}>
        <div style={{
          width:'40px', height:'40px', borderRadius:'50%',
          border:'3px solid #222', borderTop:'3px solid #7c3aed',
          animation:'spin 0.8s linear infinite'
        }}/>
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      </div>
    )
  }

  return (
    <>
      {children}
      {!isAuthPage && <BottomBar />}
    </>
  )
}
'use client'
import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import PageTransition from '../../components/PageTransition'
import { supabase } from '../../lib/supabase'

export default function UserProfilePage() {
  const router = useRouter()
  const params = useParams()
  const profileId = params?.id as string

  const [profile, setProfile] = useState<any>(null)
  const [posts, setPosts] = useState<any[]>([])
  const [likeCounts, setLikeCounts] = useState<Record<string, number>>({})
  const [isFollowing, setIsFollowing] = useState(false)
  const [followersCount, setFollowersCount] = useState(0)
  const [followingCount, setFollowingCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setCurrentUserId(session.user.id)
        if (session.user.id === profileId) router.push('/profile')
      }
    })
  }, [profileId])

  useEffect(() => {
    if (profileId) {
      fetchProfile()
      fetchPosts()
      fetchFollowCounts()
    }
  }, [profileId])

  useEffect(() => {
    if (currentUserId && profileId) checkFollow()
  }, [currentUserId, profileId])

  const fetchProfile = async () => {
    const { data } = await supabase.from('profiles').select('*').eq('id', profileId).single()
    setProfile(data)
    setLoading(false)
  }

  const fetchPosts = async () => {
    const { data } = await supabase.from('posts').select('*').eq('user_id', profileId).order('created_at', { ascending: false })
    const postsArr = data || []
    setPosts(postsArr)
    if (postsArr.length > 0) {
      const ids = postsArr.map((p: any) => p.id)
      const { data: likesData } = await supabase.from('likes').select('post_id').in('post_id', ids)
      const counts: Record<string, number> = {}
      ids.forEach((id: string) => counts[id] = 0)
      likesData?.forEach((l: any) => { counts[l.post_id] = (counts[l.post_id] || 0) + 1 })
      setLikeCounts(counts)
    }
  }

  const fetchFollowCounts = async () => {
    const { count: followers } = await supabase.from('follows').select('*', { count: 'exact', head: true }).eq('following_id', profileId)
    const { count: following } = await supabase.from('follows').select('*', { count: 'exact', head: true }).eq('follower_id', profileId)
    setFollowersCount(followers || 0)
    setFollowingCount(following || 0)
  }

  const checkFollow = async () => {
    const { data } = await supabase.from('follows').select('id').eq('follower_id', currentUserId).eq('following_id', profileId).single()
    setIsFollowing(!!data)
  }

  const handleFollow = async () => {
    if (!currentUserId) return
    if (isFollowing) {
      await supabase.from('follows').delete().eq('follower_id', currentUserId).eq('following_id', profileId)
      setIsFollowing(false)
      setFollowersCount(prev => Math.max(prev - 1, 0))
    } else {
      await supabase.from('follows').insert({ follower_id: currentUserId, following_id: profileId })
      setIsFollowing(true)
      setFollowersCount(prev => prev + 1)
      await supabase.from('notifications').insert({
        user_id: profileId,
        actor_id: currentUserId,
        type: 'follow',
        post_id: null,
      })
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

  if (loading) return (
    <div style={{display:'flex', justifyContent:'center', alignItems:'center', minHeight:'100vh', background:'var(--bg)'}}>
      <div style={{width:'32px', height:'32px', borderRadius:'50%', border:'3px solid #222', borderTop:'3px solid #7c3aed', animation:'spin 0.8s linear infinite'}}/>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )

  return (
    <PageTransition>
      <main>
        <div style={{
          position:'fixed', top:0, left:0, right:0, zIndex:100,
          background:'var(--bg)', borderBottom:'1px solid var(--border)',
          display:'flex', alignItems:'center', gap:'12px', padding:'14px 16px'
        }}>
          <button onClick={() => router.back()} style={{background:'none', border:'none', color:'var(--text)', fontSize:'20px', cursor:'pointer'}}>←</button>
          <span style={{fontWeight:600, fontSize:'16px', color:'var(--text)'}}>{profile?.username || 'Профіль'}</span>
        </div>

        <div style={{maxWidth:'580px', margin:'0 auto', padding:'70px 16px 90px'}}>
          <div className="animate-fade-up" style={{display:'flex', alignItems:'center', gap:'16px', marginBottom:'20px'}}>
            <div style={{
              width:'72px', height:'72px', borderRadius:'50%', flexShrink:0,
              background:'linear-gradient(135deg, #7c3aed, #ec4899)',
              display:'flex', alignItems:'center', justifyContent:'center',
              fontSize:'28px', fontWeight:700, color:'#fff', overflow:'hidden'
            }}>
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} style={{width:'100%', height:'100%', objectFit:'cover'}}/>
              ) : profile?.username?.[0]?.toUpperCase() || '?'}
            </div>
            <div style={{flex:1}}>
              <p style={{fontSize:'20px', fontWeight:700, color:'var(--text)'}}>{profile?.username || 'user'}</p>
              <p style={{fontSize:'14px', color:'var(--text3)', marginTop:'2px'}}>{profile?.city ? `🇺🇦 ${profile.city}` : '🇺🇦 Україна'}</p>
            </div>
          </div>

          {profile?.bio && (
            <p style={{fontSize:'14px', color:'var(--text2)', lineHeight:'1.5', marginBottom:'20px'}}>{profile.bio}</p>
          )}

          <div className="animate-fade-up delay-1" style={{
            display:'grid', gridTemplateColumns:'1fr 1fr 1fr',
            gap:'1px', background:'var(--border)', borderRadius:'12px',
            overflow:'hidden', marginBottom:'20px'
          }}>
            {[
              { label: 'Пости', value: posts.length },
              { label: 'Підписники', value: followersCount },
              { label: 'Підписки', value: followingCount },
            ].map(stat => (
              <div key={stat.label} style={{background:'var(--bg2)', padding:'14px', textAlign:'center'}}>
                <p style={{fontSize:'18px', fontWeight:700, color:'var(--text)'}}>{stat.value}</p>
                <p style={{fontSize:'12px', color:'var(--text3)', marginTop:'2px'}}>{stat.label}</p>
              </div>
            ))}
          </div>

          <button onClick={handleFollow} style={{
            width:'100%', padding:'12px', borderRadius:'12px', marginBottom:'12px',
            background: isFollowing ? 'none' : 'var(--accent)',
            border: isFollowing ? '1px solid var(--border)' : 'none',
            color: isFollowing ? 'var(--text)' : '#fff',
            fontSize:'15px', fontWeight:600, cursor:'pointer', transition:'all 0.2s'
          }}>
            {isFollowing ? 'Відписатись' : 'Підписатись'}
          </button>

          <button onClick={() => router.push(`/chat/${profileId}`)} style={{
            width:'100%', padding:'12px', borderRadius:'12px', marginBottom:'24px',
            background:'none', border:'1px solid var(--border)',
            color:'var(--text)', fontSize:'15px', fontWeight:600, cursor:'pointer'
          }}>
            💬 Написати
          </button>

          {posts.length === 0 ? (
            <div style={{textAlign:'center', color:'var(--text3)', marginTop:'40px'}}>
              <p style={{fontSize:'32px', marginBottom:'12px'}}>✍️</p>
              <p style={{fontSize:'14px'}}>Ще немає постів</p>
            </div>
          ) : posts.map((post, i) => (
            <div key={post.id} className={`post animate-fade-up delay-${Math.min(i+1,5)}`}
              style={{cursor:'pointer'}} onClick={() => router.push(`/post/${post.id}`)}>
              <div className="post-header">
                <div style={{
                  width:'38px', height:'38px', borderRadius:'50%', flexShrink:0,
                  background:'linear-gradient(135deg, #7c3aed, #ec4899)',
                  display:'flex', alignItems:'center', justifyContent:'center',
                  fontSize:'16px', fontWeight:700, color:'#fff', overflow:'hidden'
                }}>
                  {profile?.avatar_url ? (
                    <img src={profile.avatar_url} style={{width:'100%', height:'100%', objectFit:'cover'}}/>
                  ) : profile?.username?.[0]?.toUpperCase() || '?'}
                </div>
                <div>
                  <p className="username">{profile?.username || 'user'}</p>
                  <div style={{display:'flex', alignItems:'center', gap:'6px'}}>
                    <p className="time">{timeAgo(post.created_at)}</p>
                    <span style={{color:'var(--text3)', fontSize:'11px'}}>·</span>
                    <span style={{fontSize:'11px', color:'var(--accent)'}}>{post.sub}</span>
                  </div>
                </div>
              </div>
              <p className="post-text">{post.text}</p>
              <div className="post-actions">
                <button className="action-btn" onClick={e => e.stopPropagation()}>❤️ {likeCounts[post.id] || 0}</button>
                <button className="action-btn" onClick={e => e.stopPropagation()}>💬 {post.comments_count || 0}</button>
                <button className="action-btn" onClick={e => e.stopPropagation()}>🔁 Поділитись</button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </PageTransition>
  )
}
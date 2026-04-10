'use client'
import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { supabase } from '../../lib/supabase'
import PageTransition from '../../components/PageTransition'

export default function PostPage() {
  const router = useRouter()
  const params = useParams()
  const postId = params?.id as string

  const [post, setPost] = useState<any>(null)
  const [comments, setComments] = useState<any[]>([])
  const [newComment, setNewComment] = useState('')
  const [liked, setLiked] = useState(false)
  const [likesCount, setLikesCount] = useState(0)
  const [userId, setUserId] = useState<string | null>(null)
  const [myProfile, setMyProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setUserId(session.user.id)
        fetchMyProfile(session.user.id)
      }
    })
  }, [])

  useEffect(() => {
    if (postId) {
      fetchPost()
      fetchComments()
    }
  }, [postId])

  useEffect(() => {
    if (postId && userId) checkLike()
  }, [postId, userId])

  const fetchMyProfile = async (uid: string) => {
    const { data } = await supabase.from('profiles').select('*').eq('id', uid).single()
    setMyProfile(data)
  }

  const fetchPost = async () => {
    const { data } = await supabase
      .from('posts')
      .select('*, profiles(username, avatar_url)')
      .eq('id', postId)
      .single()
    setPost(data)
    const { count } = await supabase
      .from('likes')
      .select('*', { count: 'exact', head: true })
      .eq('post_id', postId)
    setLikesCount(count || 0)
    setLoading(false)
  }

  const fetchComments = async () => {
    const { data } = await supabase
      .from('comments')
      .select('*, profiles(username, avatar_url)')
      .eq('post_id', postId)
      .order('created_at', { ascending: true })
    setComments(data || [])
  }

  const checkLike = async () => {
    const { data } = await supabase
      .from('likes').select('id')
      .eq('post_id', postId).eq('user_id', userId).single()
    setLiked(!!data)
  }

  const handleLike = async () => {
    if (!userId) return
    if (liked) {
      await supabase.from('likes').delete().eq('post_id', postId).eq('user_id', userId)
      setLiked(false)
      setLikesCount(prev => Math.max(prev - 1, 0))
    } else {
      await supabase.from('likes').insert({ post_id: postId, user_id: userId })
      setLiked(true)
      setLikesCount(prev => prev + 1)
      if (post.user_id !== userId) {
        await supabase.from('notifications').insert({
          user_id: post.user_id,
          actor_id: userId,
          type: 'like',
          post_id: postId,
        })
      }
    }
  }

  const handleComment = async () => {
    if (!newComment.trim() || !userId) return
    const { data } = await supabase.from('comments').insert({
      post_id: postId,
      user_id: userId,
      text: newComment.trim()
    }).select('*, profiles(username, avatar_url)').single()

    if (data) {
      setComments(prev => [...prev, data])
      setNewComment('')
      if (post.user_id !== userId) {
        await supabase.from('notifications').insert({
          user_id: post.user_id,
          actor_id: userId,
          type: 'comment',
          post_id: postId,
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

  const Avatar = ({ profile, size = 38 }: { profile: any, size?: number }) => (
    <div style={{
      width:`${size}px`, height:`${size}px`, borderRadius:'50%', flexShrink:0,
      background:'linear-gradient(135deg, #7c3aed, #ec4899)',
      display:'flex', alignItems:'center', justifyContent:'center',
      fontSize:`${size * 0.4}px`, fontWeight:700, color:'#fff', overflow:'hidden'
    }}>
      {profile?.avatar_url ? (
        <img src={profile.avatar_url} style={{width:'100%', height:'100%', objectFit:'cover'}}/>
      ) : profile?.username?.[0]?.toUpperCase() || '?'}
    </div>
  )

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
          <span style={{fontWeight:600, fontSize:'16px', color:'var(--text)'}}>Пост</span>
        </div>

        <div style={{maxWidth:'580px', margin:'0 auto', padding:'70px 16px 100px'}}>
          {post && (
            <div className="post" style={{marginBottom:'8px'}}>
              <div className="post-header">
                <div onClick={() => router.push(`/user/${post.user_id}`)} style={{cursor:'pointer'}}>
                  <Avatar profile={post.profiles} size={38}/>
                </div>
                <div>
                  <p className="username" style={{cursor:'pointer'}}
                    onClick={() => router.push(`/user/${post.user_id}`)}>
                    {post.profiles?.username || 'user'}
                  </p>
                  <div style={{display:'flex', gap:'6px', alignItems:'center'}}>
                    <p className="time">{timeAgo(post.created_at)}</p>
                    <span style={{color:'var(--text3)', fontSize:'11px'}}>·</span>
                    <span style={{fontSize:'11px', color:'var(--accent)'}}>{post.sub}</span>
                  </div>
                </div>
              </div>
              <p style={{fontSize:'16px', color:'var(--text)', lineHeight:'1.6', marginBottom:'16px'}}>{post.text}</p>
              <div className="post-actions">
                <button className="action-btn" onClick={handleLike} style={{color: liked ? '#ec4899' : 'var(--text3)'}}>
                  {liked ? '❤️' : '🤍'} {likesCount}
                </button>
                <button className="action-btn">💬 {comments.length}</button>
                <button className="action-btn">🔁 Поділитись</button>
              </div>
            </div>
          )}

          <div style={{borderTop:'1px solid var(--border)', paddingTop:'8px'}}>
            {comments.length === 0 ? (
              <p style={{textAlign:'center', color:'var(--text3)', fontSize:'14px', marginTop:'32px'}}>
                Коментарів поки немає. Будь першим!
              </p>
            ) : comments.map((c) => (
              <div key={c.id} style={{padding:'14px 0', borderBottom:'1px solid var(--border)'}}>
                <div className="post-header" style={{marginBottom:'8px'}}>
                  <div onClick={() => router.push(`/user/${c.user_id}`)} style={{cursor:'pointer'}}>
                    <Avatar profile={c.profiles} size={32}/>
                  </div>
                  <div>
                    <p className="username" style={{fontSize:'13px', cursor:'pointer'}}
                      onClick={() => router.push(`/user/${c.user_id}`)}>
                      {c.profiles?.username || 'user'}
                    </p>
                    <p className="time">{timeAgo(c.created_at)}</p>
                  </div>
                </div>
                <p style={{fontSize:'14px', color:'var(--text2)', lineHeight:'1.5', marginLeft:'44px'}}>{c.text}</p>
              </div>
            ))}
          </div>
        </div>

        <div style={{
          position:'fixed', bottom:0, left:0, right:0, zIndex:200,
          background:'var(--bg)', borderTop:'1px solid var(--border)',
          padding:'12px 16px 32px', display:'flex', gap:'10px', alignItems:'center'
        }}>
          <Avatar profile={myProfile} size={32}/>
          <input
            value={newComment}
            onChange={e => setNewComment(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleComment()}
            placeholder="Написати коментар..."
            style={{
              flex:1, background:'var(--bg3)', border:'1px solid var(--border)',
              borderRadius:'999px', padding:'10px 16px',
              color:'var(--text)', fontSize:'14px', outline:'none', fontFamily:'inherit'
            }}
          />
          <button onClick={handleComment} style={{
            background:'var(--accent)', border:'none', borderRadius:'999px',
            padding:'10px 16px', color:'#fff', fontSize:'14px', cursor:'pointer'
          }}>↑</button>
        </div>
      </main>
    </PageTransition>
  )
}
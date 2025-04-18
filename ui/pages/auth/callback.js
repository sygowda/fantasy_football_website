import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../../lib/supabase'
import { syncUser } from '../../lib/api'

export default function AuthCallback() {
  const [message, setMessage] = useState('Processing authentication...')
  const router = useRouter()

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Get the session from the URL hash
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          setMessage(`Authentication error: ${error.message}`)
          return
        }
        
        if (session) {
          // Sync user with backend
          const syncResponse = await syncUser(session.user)
          // Store user data in localStorage
          localStorage.setItem('user', JSON.stringify(syncResponse.data))
          setMessage('Authentication successful! Redirecting...')
          router.push('/dashboard')
        } else {
          setMessage('No session found. Please try logging in again.')
          setTimeout(() => {
            router.push('/login')
          }, 3000)
        }
      } catch (err) {
        setMessage(`Error: ${err.message}`)
        setTimeout(() => {
          router.push('/login')
        }, 3000)
      }
    }

    handleAuthCallback()
  }, [router])

  return (
    <div style={{ padding: 20, textAlign: 'center' }}>
      <h1>Authentication Callback</h1>
      <p>{message}</p>
      <p>If you are not redirected automatically, <a href="/login">click here</a>.</p>
    </div>
  )
} 
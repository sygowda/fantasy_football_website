import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../lib/supabase'

export default function ProtectedRoute({ children, adminOnly = false }) {
  const [loading, setLoading] = useState(true)
  const [isAllowed, setIsAllowed] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/login')
        return
      }

      if (adminOnly) {
        const { data: { user } } = await supabase.auth.getUser()
        if (user.email !== 'admin@example.com') {
          router.push('/')
          return
        }
      }

      setIsAllowed(true)
      setLoading(false)
    }

    checkAuth()
  }, [])

  if (loading) return <p>Loading...</p>
  return isAllowed ? children : null
}
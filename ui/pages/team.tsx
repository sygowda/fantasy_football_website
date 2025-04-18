// pages/team.tsx

import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../lib/supabase'
import axios from 'axios'

export default function TeamPage() {
  const [team, setTeam] = useState(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const fetchTeam = async () => {
      const session = await supabase.auth.getSession()
      const token = session.data.session?.access_token

      if (!token) return router.push('/login')

      try {
        const res = await axios.get('/team', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (res.data.team) {
          setTeam(res.data.team)
        } else {
          router.push('/team') // no team yet
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchTeam()
  }, [])

  if (loading) return <p>Loading...</p>

  return (
    <div>
      <h1>Your Fantasy Team</h1>
      {team && (
        <ul>
          {team.player_ids.map((id) => (
            <li key={id}>{id}</li> // later, fetch full player info
          ))}
        </ul>
      )}
    </div>
  )
}

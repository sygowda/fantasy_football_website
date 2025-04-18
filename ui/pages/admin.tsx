import { useState, useEffect } from 'react'
import ProtectedRoute from '../components/ProtectedRoute'
import { useRouter } from 'next/router'
import { supabase } from '../lib/supabase'

interface Player {
  id: string;
  name: string;
  position: string;
  points: number;
}

export default function AdminPage() {
  const [name, setName] = useState('')
  const [position, setPosition] = useState('DEF')
  const [points, setPoints] = useState(0)
  const [players, setPlayers] = useState<Player[]>([])
  const router = useRouter()

  const addPlayer = async () => {
    try {
      const { data, error } = await supabase
        .from('players')
        .insert([{ name, position, points }])
        .select()

      if (error) throw error
      fetchPlayers()
      setName('')
      setPoints(0)
    } catch (error) {
      console.error('Error adding player:', error)
    }
  }

  const updatePoints = async (id: string, points: number) => {
    try {
      const { error } = await supabase
        .from('players')
        .update({ points })
        .eq('id', id)

      if (error) throw error
      fetchPlayers()
    } catch (error) {
      console.error('Error updating points:', error)
    }
  }

  const fetchPlayers = async () => {
    try {
      const { data, error } = await supabase
        .from('players')
        .select('*')
        .order('name')

      if (error) throw error
      setPlayers(data || [])
    } catch (error) {
      console.error('Error fetching players:', error)
    }
  }

  useEffect(() => {
    fetchPlayers()
  }, [])

  return (
    <ProtectedRoute adminOnly={true}>
      <div className="min-h-screen bg-gray-100 py-6 flex flex-col justify-center sm:py-12">
        <div className="relative py-3 sm:max-w-xl sm:mx-auto">
          <div className="relative px-4 py-10 bg-white shadow-lg sm:rounded-3xl sm:p-20">
            <div className="max-w-md mx-auto">
              <div className="divide-y divide-gray-200">
                <div className="py-8 text-base leading-6 space-y-4 text-gray-700 sm:text-lg sm:leading-7">
                  <h2 className="text-2xl font-bold mb-4">Admin Dashboard</h2>
                  
                  {/* Add Player Form */}
                  <div className="mb-8">
                    <h3 className="text-xl font-semibold mb-4">Add New Player</h3>
                    <div className="space-y-4">
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Player Name"
                        className="w-full px-3 py-2 border rounded-md"
                      />
                      <select
                        value={position}
                        onChange={(e) => setPosition(e.target.value)}
                        className="w-full px-3 py-2 border rounded-md"
                      >
                        <option value="DEF">Defender</option>
                        <option value="FWD">Forward</option>
                      </select>
                      <input
                        type="number"
                        value={points}
                        onChange={(e) => setPoints(Number(e.target.value))}
                        placeholder="Points"
                        className="w-full px-3 py-2 border rounded-md"
                      />
                      <button
                        onClick={addPlayer}
                        className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600"
                      >
                        Add Player
                      </button>
                    </div>
                  </div>

                  {/* Players List */}
                  <div>
                    <h3 className="text-xl font-semibold mb-4">Players</h3>
                    <div className="space-y-4">
                      {players.map((player) => (
                        <div key={player.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-md">
                          <div>
                            <p className="font-medium">{player.name}</p>
                            <p className="text-sm text-gray-500">{player.position}</p>
                          </div>
                          <div className="flex items-center space-x-4">
                            <input
                              type="number"
                              value={player.points}
                              onChange={(e) => updatePoints(player.id, Number(e.target.value))}
                              className="w-20 px-2 py-1 border rounded-md"
                            />
                            <span className="text-sm text-gray-500">points</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
} 

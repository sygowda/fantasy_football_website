import { useState, useEffect } from 'react'
import ProtectedRoute from '../components/ProtectedRoute'

export default function AdminPage() {
  const [name, setName] = useState('')
  const [position, setPosition] = useState('DEF')
  const [points, setPoints] = useState(0)
  const [players, setPlayers] = useState([])

  const addPlayer = async () => {
    await fetch('http://localhost:8000/admin/players', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, position, points })
    })
    setName('')
    fetchPlayers()
  }

  const updatePoints = async (id, points) => {
    await fetch(`http://localhost:8000/admin/players/${id}/points`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ points })
    })
    fetchPlayers()
  }

  const fetchPlayers = async () => {
    const res = await fetch('http://localhost:8000/players')
    const data = await res.json()
    setPlayers(data)
  }

  useEffect(() => {
    fetchPlayers()
  }, [])

  return (
    <ProtectedRoute adminOnly={true}>
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-4">Admin Panel</h1>

        <div className="mb-6">
          <input className="border p-2 mr-2" placeholder="Player Name" value={name} onChange={e => setName(e.target.value)} />
          <select className="border p-2 mr-2" value={position} onChange={e => setPosition(e.target.value)}>
            <option value="DEF">Defender</option>
            <option value="MID">Midfielder</option>
            <option value="ATT">Attacker</option>
          </select>
          <input className="border p-2 mr-2" type="number" value={points} onChange={e => setPoints(+e.target.value)} />
          <button className="bg-blue-500 text-white px-4 py-2" onClick={addPlayer}>Add Player</button>
        </div>

        <h2 className="text-xl mb-2">Update Points</h2>
        <ul>
          {players.map(p => (
            <li key={p.id} className="mb-2">
              {p.name} - {p.position} - {p.points} pts
              <input className="border p-1 mx-2" type="number" placeholder="New Points" onBlur={e => updatePoints(p.id, +e.target.value)} />
            </li>
          ))}
        </ul>
      </div>
    </ProtectedRoute>
  )
}

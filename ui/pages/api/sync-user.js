export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).end()
  
    const backendRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/sync-user`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body),
    })
  
    const result = await backendRes.json()
    res.status(backendRes.status).json(result)
  }
  
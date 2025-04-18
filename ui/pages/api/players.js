export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get the authorization header from the request
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'No authorization header' });
    }

    // Forward the request to the backend
    const response = await fetch('http://localhost:8000/players', {
      headers: {
        'Authorization': authHeader
      }
    });

    const data = await response.json();
    res.status(response.status).json(data);
  } catch (error) {
    console.error('Error handling players request:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
} 
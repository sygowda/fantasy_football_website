// API functions to interact with the FastAPI backend

/**
 * Syncs a user with the backend database
 * @param {Object} user - The user object from Supabase auth
 * @returns {Promise<Object>} - The response from the backend
 */
export async function syncUser(user) {
  try {
    // Extract user data, ensuring we have the required fields
    const userId = user.id;
    const fullName = user.user_metadata?.full_name || user.email || 'Unknown User';
    const email = user.email;
    
    // First sync the user with the backend
    const syncResponse = await fetch(`http://localhost:8000/sync-user`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id: userId,
        full_name: fullName,
        email: email
      }),
    });

    if (!syncResponse.ok) {
      const errorData = await syncResponse.json();
      console.error('Error syncing user:', errorData);
      throw new Error(errorData.detail || 'Failed to sync user');
    }

    const syncData = await syncResponse.json();
    console.log('Sync response:', syncData);

    // Then try to get the user data
    const userResponse = await fetch(`http://localhost:8000/users/${userId}`);
    
    // If user not found (404), return the original user data
    if (userResponse.status === 404) {
      console.log('User not found in backend, using original data');
      return user;
    }
    
    if (!userResponse.ok) {
      throw new Error('Failed to fetch user data');
    }

    const userData = await userResponse.json();
    return userData;
  } catch (error) {
    console.error('Error syncing user:', error);
    // Return the original user data if there's an error
    return user;
  }
} 
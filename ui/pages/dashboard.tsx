import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import { supabase } from '../lib/supabase';
import CreateTeamForm from '../components/CreateTeamForm';
import TeamEditStatus from '../components/TeamEditStatus';

interface User {
  id: string;
  full_name: string;
  username: string;
  role: string;
}

interface Player {
  id: string;
  name: string;
  position: string;
  price: number;
  points?: number;
  goals_scored?: number;
  assists?: number;
  clean_sheets?: number;
}

interface Team {
  id: string;
  user_id: string;
  player_ids: string[];
  players: Player[];
}

const getFormation = (players: Player[]): string => {
  console.log('Calculating formation for players:', players);
  const goalkeeperCount = players.filter(p => p.position.toLowerCase() === 'goalkeeper').length;
  const defenderCount = players.filter(p => p.position.toLowerCase() === 'defender').length;
  const forwardCount = players.filter(p => p.position.toLowerCase() === 'forward').length;
  console.log('Counts:', { goalkeeperCount, defenderCount, forwardCount });
  return `${goalkeeperCount}-${defenderCount}-${forwardCount}`;
};

// Add deadline constant
const TEAM_EDIT_DEADLINE = new Date('2025-04-20T23:59:59');

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [team, setTeam] = useState<Team | null>(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      localStorage.removeItem('user');
      router.push('/');
    } catch (error) {
      console.error('Error logging out:', error);
      setError('Failed to logout');
    }
  };

  const fetchTeam = async (userId: string, session: any) => {
    try {
      console.log('Fetching team for user:', userId);
      const response = await fetch(`http://localhost:8000/team?user_id=${userId}`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });

      console.log('Team response status:', response.status);
      
      if (response.status === 404) {
        // No team found for this user
        console.log('No team found for user');
        setTeam(null);
        return;
      }
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error fetching team:', errorData);
        setError(errorData.detail || 'Failed to fetch team');
        return;
      }
      
      const data = await response.json();
      console.log('Raw team data:', data);
      
      // Check if data is null or undefined
      if (!data) {
        console.log('No data received from server');
        setTeam(null);
        return;
      }
      
      console.log('Team data type:', typeof data);
      console.log('Team data keys:', Object.keys(data));
      console.log('Players data:', data.players);

      // Check if data itself is the team object
      if (data.id && data.user_id && data.player_ids && Array.isArray(data.players)) {
        console.log('Data is team object, setting directly');
        setTeam(data);
      } else {
        console.log('Invalid team data structure');
        setTeam(null);
      }
    } catch (error) {
      console.error('Error in fetchTeam:', error);
      setError('Failed to fetch team');
    }
  };

  const handleCreateTeam = async (playerIds: string[]) => {
    try {
      setCreating(true);
      setError(null);

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/');
        return;
      }

      const response = await fetch('http://localhost:8000/team', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ player_ids: playerIds })
      });

      if (response.ok) {
        const data = await response.json();
        setTeam(data.team);
        setShowCreateForm(false);
      } else {
        const error = await response.json();
        setError(error.detail || 'Failed to create team');
      }
    } catch (error) {
      console.error('Error creating team:', error);
      setError('Failed to create team');
    } finally {
      setCreating(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get the session first
        const { data: { session } } = await supabase.auth.getSession();
        console.log('Session:', session);
        
        if (!session) {
          console.log('No session found, redirecting to home');
          router.push('/');
          return;
        }

        // Set user from session
        const userData = {
          id: session.user.id,
          full_name: session.user.user_metadata?.full_name || session.user.email || 'Unknown User',
          username: session.user.email,
          role: 'user'
        };
        console.log('Setting user data:', userData);
        setUser(userData);

        // Fetch team using user ID
        await fetchTeam(session.user.id, session);
      } catch (error) {
        console.error('Error in fetchData:', error);
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return null;
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-semibold">Welcome, {user.full_name}!</h2>
          <button
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
          >
            Logout
          </button>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="text-xl font-medium mb-4">Your Profile</h3>
          <div className="space-y-2">
            <p><span className="font-medium">Email:</span> {user.username}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="text-xl font-medium mb-4">Your Team</h3>
          {error && (
            <p className="text-red-500 mb-4">{error}</p>
          )}
          {loading ? (
            <p>Loading team data...</p>
          ) : team && team.players ? (
            <div className="space-y-4">
              <TeamEditStatus 
                onEditClick={() => setShowEditForm(true)}
                deadline={TEAM_EDIT_DEADLINE}
              />
              
              <div className="flex items-center space-x-2">
                <span className="font-medium">Formation:</span>
                <span className="text-green-600 dark:text-green-400">
                  {getFormation(team.players)}
                </span>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Goalkeeper</h4>
                  <ul className="space-y-1">
                    {team.players
                      .filter(p => p.position.toLowerCase() === 'goalkeeper')
                      .map(player => (
                        <li key={player.id} className="flex items-center space-x-2">
                          <span>{player.name}</span>
                          <span className="text-green-600 ml-2">
                            {player.points || 0} pts • {player.clean_sheets || 0} clean sheets
                          </span>
                        </li>
                      ))}
                  </ul>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Defenders</h4>
                  <ul className="space-y-1">
                    {team.players
                      .filter(p => p.position.toLowerCase() === 'defender')
                      .map(player => (
                        <li key={player.id} className="flex items-center space-x-2">
                          <span>{player.name}</span>
                          <span className="text-green-600 ml-2">
                            {player.points || 0} pts • {player.goals_scored || 0} goals • {player.assists || 0} assists • {player.clean_sheets || 0} clean sheets
                          </span>
                        </li>
                      ))}
                  </ul>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Forwards</h4>
                  <ul className="space-y-1">
                    {team.players
                      .filter(p => p.position.toLowerCase() === 'forward')
                      .map(player => (
                        <li key={player.id} className="flex items-center space-x-2">
                          <span>{player.name}</span>
                          <span className="text-green-600 ml-2">
                            {player.points || 0} pts • {player.goals_scored || 0} goals • {player.assists || 0} assists
                          </span>
                        </li>
                      ))}
                  </ul>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-gray-600 dark:text-gray-400">No team found.</p>
              <button
                onClick={() => setShowCreateForm(true)}
                className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
              >
                Create Team
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Edit Team Form Modal */}
      {showEditForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Edit Team</h2>
              <button
                onClick={() => setShowEditForm(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            {(() => { console.log('Opening edit form with team:', team); return null; })()}
            <CreateTeamForm
              onTeamCreated={(updatedTeam) => {
                console.log('Team updated:', updatedTeam);
                setTeam(updatedTeam);
                setShowEditForm(false);
              }}
              initialPlayers={team?.players || []}
              isEditing={true}
            />
          </div>
        </div>
      )}

      {/* Create Team Form Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Create Team</h2>
              <button
                onClick={() => setShowCreateForm(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <CreateTeamForm
              onTeamCreated={(newTeam) => {
                setTeam(newTeam);
                setShowCreateForm(false);
              }}
            />
          </div>
        </div>
      )}
    </Layout>
  );
} 
import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useRouter } from 'next/router';

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

interface Formation {
  id: string;
  name: string;
  requirements: {
    goalkeeper: number;
    defender: number;
    forward: number;
  };
}

const formations: Formation[] = [
  {
    id: '1-2-2',
    name: '1-2-2 (1 Goalkeeper, 2 Defenders, 2 Forwards)',
    requirements: {
      goalkeeper: 1,
      defender: 2,
      forward: 2
    }
  },
  {
    id: '1-1-3',
    name: '1-1-3 (1 Goalkeeper, 1 Defender, 3 Forwards)',
    requirements: {
      goalkeeper: 1,
      defender: 1,
      forward: 3
    }
  },
  {
    id: '1-3-1',
    name: '1-3-1 (1 Goalkeeper, 3 Defenders, 1 Forward)',
    requirements: {
      goalkeeper: 1,
      defender: 3,
      forward: 1
    }
  }
];

interface CreateTeamFormProps {
  onTeamCreated: (team: any) => void;
  initialPlayers?: Player[];
  isEditing?: boolean;
  initialTeam?: any;
}

export default function CreateTeamForm({ onTeamCreated, initialPlayers = [], isEditing = false, initialTeam }: CreateTeamFormProps) {
  const [players, setPlayers] = useState<Player[]>([]);
  const [selectedFormation, setSelectedFormation] = useState<string>('');
  const [selectedPlayers, setSelectedPlayers] = useState<{
    goalkeeper: Player[];
    defender: Player[];
    forward: Player[];
  }>({
    goalkeeper: [],
    defender: [],
    forward: []
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchPlayers();
  }, []);

  // Initialize selected players if editing
  useEffect(() => {
    if (isEditing && initialPlayers.length > 0) {
      console.log('Initializing edit mode with players:', initialPlayers);
      const initialSelectedPlayers = {
        goalkeeper: initialPlayers.filter(p => p.position.toLowerCase() === 'goalkeeper').map(p => p),
        defender: initialPlayers.filter(p => p.position.toLowerCase() === 'defender').map(p => p),
        forward: initialPlayers.filter(p => p.position.toLowerCase() === 'forward').map(p => p)
      };
      console.log('Initial selected players by position:', initialSelectedPlayers);
      setSelectedPlayers(initialSelectedPlayers);

      // Find and set the matching formation
      const formation = formations.find(f => 
        f.requirements.goalkeeper === initialSelectedPlayers.goalkeeper.length &&
        f.requirements.defender === initialSelectedPlayers.defender.length &&
        f.requirements.forward === initialSelectedPlayers.forward.length
      );
      console.log('Found matching formation:', formation);
      if (formation) {
        setSelectedFormation(formation.id);
      }
    }
  }, [isEditing, initialPlayers]);

  const fetchPlayers = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        console.error('No session found, redirecting to login');
        router.push('/login');
        return;
      }

      const response = await fetch('/api/players', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Failed to fetch players:', errorData);
        setError('Failed to fetch players: ' + (errorData.error || 'Unknown error'));
        return;
      }

      const data = await response.json();
      setPlayers(data);
    } catch (error) {
      console.error('Error fetching players:', error);
      setError('Failed to fetch players: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const handleFormationChange = (formationId: string) => {
    setSelectedFormation(formationId);
    // Reset selected players when formation changes
    setSelectedPlayers({
      goalkeeper: [],
      defender: [],
      forward: []
    });
  };

  const handlePlayerSelect = (position: 'goalkeeper' | 'defender' | 'forward', player: Player) => {
    const formation = formations.find(f => f.id === selectedFormation);
    if (!formation) return;

    setSelectedPlayers(prev => {
      const currentPlayers = [...prev[position]];
      const index = currentPlayers.findIndex(p => p.id === player.id);
      
      if (index === -1) {
        // Check if adding this player would exceed the formation requirements
        if (currentPlayers.length >= formation.requirements[position]) {
          setError(`Cannot select more than ${formation.requirements[position]} ${position}s for this formation`);
          return prev;
        }
        currentPlayers.push(player);
      } else {
        currentPlayers.splice(index, 1);
      }
      
      return {
        ...prev,
        [position]: currentPlayers
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFormation) {
      setError('Please select a formation');
      return;
    }

    const allSelectedPlayers = [
      ...selectedPlayers.goalkeeper,
      ...selectedPlayers.defender,
      ...selectedPlayers.forward
    ];

    console.log('Submitting team with players:', allSelectedPlayers);

    if (allSelectedPlayers.length !== 5) {
      setError('Please select exactly 5 players');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        console.error('No session found, redirecting to login');
        router.push('/login');
        return;
      }

      const playerIds = allSelectedPlayers.map(player => player.id);
      console.log('Submitting player IDs:', playerIds);
      
      const endpoint = '/api/team';
      const method = isEditing ? 'PUT' : 'POST';

      console.log(`Making ${method} request to ${endpoint}`);
      
      const response = await fetch(endpoint, {
        method,
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ player_ids: playerIds })
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error response:', errorData);
        throw new Error(errorData.error || 'Failed to save team');
      }

      const data = await response.json();
      console.log('Response data:', data);
      
      if (data.team) {
        onTeamCreated(data.team);
      } else {
        onTeamCreated(data);
      }
    } catch (error) {
      console.error('Error saving team:', error);
      setError(error instanceof Error ? error.message : 'Failed to save team');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getPlayersByPosition = (position: string) => {
    return players.filter(player => player.position.toLowerCase() === position.toLowerCase());
  };

  const isPlayerSelected = (position: 'goalkeeper' | 'defender' | 'forward', player: Player) => {
    return selectedPlayers[position].some(p => p.id === player.id);
  };

  if (loading) {
    return <div>Loading players...</div>;
  }

  const selectedFormationData = formations.find(f => f.id === selectedFormation);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 text-red-500 p-4 rounded-lg">
          {error}
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Select Formation
          </label>
          <select
            value={selectedFormation}
            onChange={(e) => handleFormationChange(e.target.value)}
            className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
            required
          >
            <option value="">Choose a formation</option>
            {formations.map(formation => (
              <option key={formation.id} value={formation.id}>
                {formation.name}
              </option>
            ))}
          </select>
        </div>

        {selectedFormation && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Goalkeeper ({selectedFormationData?.requirements.goalkeeper} required)
              </label>
              <select
                value={selectedPlayers.goalkeeper[0]?.id || ''}
                onChange={(e) => {
                  const player = players.find(p => p.id === e.target.value);
                  if (player) {
                    handlePlayerSelect('goalkeeper', player);
                  }
                }}
                className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
              >
                <option value="">Select a goalkeeper</option>
                {getPlayersByPosition('goalkeeper').map(player => (
                  <option key={player.id} value={player.id}>
                    {player.name} - {player.clean_sheets || 0} clean sheets
                  </option>
                ))}
              </select>
              {selectedPlayers.goalkeeper.length > 0 && (
                <div className="mt-2 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <p className="font-medium">{selectedPlayers.goalkeeper[0].name}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {selectedPlayers.goalkeeper[0].clean_sheets || 0} clean sheets
                  </p>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Defenders ({selectedFormationData?.requirements.defender} required)
              </label>
              {Array.from({ length: selectedFormationData?.requirements.defender || 0 }).map((_, index) => (
                <div key={index} className="mb-2">
                  <select
                    value={selectedPlayers.defender[index]?.id || ''}
                    onChange={(e) => {
                      const player = players.find(p => p.id === e.target.value);
                      if (player) {
                        // If a player is already selected at this position, remove them first
                        if (selectedPlayers.defender[index]) {
                          handlePlayerSelect('defender', selectedPlayers.defender[index]);
                        }
                        handlePlayerSelect('defender', player);
                      }
                    }}
                    className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                  >
                    <option value="">Select a defender</option>
                    {getPlayersByPosition('defender')
                      .filter(player => !selectedPlayers.defender.some(p => p.id === player.id) || selectedPlayers.defender[index]?.id === player.id)
                      .map(player => (
                        <option key={player.id} value={player.id}>
                          {player.name} - {player.goals_scored || 0} goals, {player.assists || 0} assists
                        </option>
                      ))}
                  </select>
                  {selectedPlayers.defender[index] && (
                    <div className="mt-2 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <p className="font-medium">{selectedPlayers.defender[index].name}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {selectedPlayers.defender[index].goals_scored || 0} goals, {selectedPlayers.defender[index].assists || 0} assists
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Forwards ({selectedFormationData?.requirements.forward} required)
              </label>
              {Array.from({ length: selectedFormationData?.requirements.forward || 0 }).map((_, index) => (
                <div key={index} className="mb-2">
                  <select
                    value={selectedPlayers.forward[index]?.id || ''}
                    onChange={(e) => {
                      const player = players.find(p => p.id === e.target.value);
                      if (player) {
                        // If a player is already selected at this position, remove them first
                        if (selectedPlayers.forward[index]) {
                          handlePlayerSelect('forward', selectedPlayers.forward[index]);
                        }
                        handlePlayerSelect('forward', player);
                      }
                    }}
                    className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                  >
                    <option value="">Select a forward</option>
                    {getPlayersByPosition('forward')
                      .filter(player => !selectedPlayers.forward.some(p => p.id === player.id) || selectedPlayers.forward[index]?.id === player.id)
                      .map(player => (
                        <option key={player.id} value={player.id}>
                          {player.name} - {player.goals_scored || 0} goals, {player.assists || 0} assists
                        </option>
                      ))}
                  </select>
                  {selectedPlayers.forward[index] && (
                    <div className="mt-2 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <p className="font-medium">{selectedPlayers.forward[index].name}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {selectedPlayers.forward[index].goals_scored || 0} goals, {selectedPlayers.forward[index].assists || 0} assists
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <div className="flex space-x-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50"
        >
          {isSubmitting ? (isEditing ? 'Updating Team...' : 'Creating Team...') : (isEditing ? 'Update Team' : 'Create Team')}
        </button>
      </div>
    </form>
  );
} 
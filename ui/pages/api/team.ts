import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../lib/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Get the authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const token = authHeader.split(' ')[1];

    // Verify the token with Supabase
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    // Handle different HTTP methods
    switch (req.method) {
      case 'GET':
        // Get user's team
        const { data: teamData, error: getError } = await supabase
          .from('user_teams')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (getError) {
          console.error('Error fetching team:', getError);
          return res.status(500).json({ error: 'Failed to fetch team' });
        }

        if (!teamData) {
          return res.status(404).json({ error: 'No team found' });
        }

        // Get player details
        const { data: players, error: playersError } = await supabase
          .from('players')
          .select('*')
          .in('id', teamData.player_ids);

        if (playersError) {
          console.error('Error fetching players:', playersError);
          return res.status(500).json({ error: 'Failed to fetch players' });
        }

        return res.status(200).json({
          ...teamData,
          players: players || []
        });

      case 'POST':
        // Create new team
        const { player_ids } = req.body;
        
        // Check if user already has a team
        const { data: existingTeam } = await supabase
          .from('user_teams')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (existingTeam) {
          return res.status(400).json({ error: 'User already has a team' });
        }

        // Create new team
        const { data: newTeam, error: createError } = await supabase
          .from('user_teams')
          .insert({
            user_id: user.id,
            player_ids
          })
          .select()
          .single();

        if (createError) {
          console.error('Error creating team:', createError);
          return res.status(500).json({ error: 'Failed to create team' });
        }

        // Get player details
        const { data: newPlayers, error: newPlayersError } = await supabase
          .from('players')
          .select('*')
          .in('id', player_ids);

        if (newPlayersError) {
          console.error('Error fetching players:', newPlayersError);
          return res.status(500).json({ error: 'Failed to fetch players' });
        }

        return res.status(201).json({
          team: {
            ...newTeam,
            players: newPlayers || []
          }
        });

      case 'PUT':
        // Update existing team
        const { player_ids: updatePlayerIds } = req.body;

        // Check if user has a team
        const { data: currentTeam, error: currentTeamError } = await supabase
          .from('user_teams')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (currentTeamError || !currentTeam) {
          return res.status(404).json({ error: 'No team found for user' });
        }

        // Update team
        const { data: updatedTeam, error: updateError } = await supabase
          .from('user_teams')
          .update({
            player_ids: updatePlayerIds
          })
          .eq('user_id', user.id)
          .select()
          .single();

        if (updateError) {
          console.error('Error updating team:', updateError);
          return res.status(500).json({ error: 'Failed to update team' });
        }

        // Get player details
        const { data: updatedPlayers, error: updatedPlayersError } = await supabase
          .from('players')
          .select('*')
          .in('id', updatePlayerIds);

        if (updatedPlayersError) {
          console.error('Error fetching players:', updatedPlayersError);
          return res.status(500).json({ error: 'Failed to fetch players' });
        }

        return res.status(200).json({
          team: {
            ...updatedTeam,
            players: updatedPlayers || []
          }
        });

      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT']);
        return res.status(405).json({ error: `Method ${req.method} not allowed` });
    }
  } catch (error) {
    console.error('API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
} 
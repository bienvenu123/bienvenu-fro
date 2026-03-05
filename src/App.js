import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import RoleProtectedRoute from './components/RoleProtectedRoute';
import Layout from './components/Layout/Layout';
import Login from './pages/Login';
import Countries from './pages/Countries';
import Teams from './pages/Teams';
import Awards from './pages/Awards';
import AwardWinners from './pages/AwardWinners';
import Injuries from './pages/Injuries';
import Leagues from './pages/Leagues';
import LeagueTeams from './pages/LeagueTeams';
import Managers from './pages/Managers';
import Matches from './pages/Matches';
import MatchEvents from './pages/MatchEvents';
import MatchFormations from './pages/MatchFormations';
import MatchLineups from './pages/MatchLineups';
import Players from './pages/Players';
import PlayerAttributes from './pages/PlayerAttributes';
import PlayerContracts from './pages/PlayerContracts';
import PlayerMarketValues from './pages/PlayerMarketValues';
import PlayerMatchStats from './pages/PlayerMatchStats';
import PlayerPositions from './pages/PlayerPositions';
import PlayerSeasonStats from './pages/PlayerSeasonStats';
import Positions from './pages/Positions';
import Referees from './pages/Referees';
import Seasons from './pages/Seasons';
import Stadiums from './pages/Stadiums';
import Standings from './pages/Standings';
import TeamManagers from './pages/TeamManagers';
import TeamMatchStats from './pages/TeamMatchStats';
import TeamSeasonStats from './pages/TeamSeasonStats';
import Transfers from './pages/Transfers';
import Users from './pages/Users';
import Dashboard from './pages/Dashboard';
import Reports from './pages/Reports';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="countries" element={<Countries />} />
            <Route path="teams" element={<Teams />} />
            <Route path="awards" element={<Awards />} />
            <Route path="award-winners" element={<AwardWinners />} />
            <Route path="injuries" element={<Injuries />} />
            <Route path="leagues" element={<Leagues />} />
            <Route path="league-teams" element={<LeagueTeams />} />
            <Route path="managers" element={<Managers />} />
            <Route path="players" element={<Players />} />
            <Route path="matches" element={<Matches />} />
            <Route path="match-events" element={<MatchEvents />} />
            <Route path="match-formations" element={<MatchFormations />} />
            <Route path="match-lineups" element={<MatchLineups />} />
            <Route path="player-attributes" element={<PlayerAttributes />} />
            <Route path="player-contracts" element={<PlayerContracts />} />
            <Route path="player-market-values" element={<PlayerMarketValues />} />
            <Route path="player-match-stats" element={<PlayerMatchStats />} />
            <Route path="player-positions" element={<PlayerPositions />} />
            <Route path="player-season-stats" element={<PlayerSeasonStats />} />
            <Route path="positions" element={<Positions />} />
            <Route path="referees" element={<Referees />} />
            <Route path="seasons" element={<Seasons />} />
            <Route path="stadiums" element={<Stadiums />} />
            <Route path="standings" element={<Standings />} />
            <Route path="team-managers" element={<TeamManagers />} />
            <Route path="team-match-stats" element={<TeamMatchStats />} />
            <Route path="team-season-stats" element={<TeamSeasonStats />} />
            <Route path="transfers" element={<Transfers />} />
            <Route 
              path="users" 
              element={
                <RoleProtectedRoute allowedRoles={['ADMIN']}>
                  <Users />
                </RoleProtectedRoute>
              } 
            />
            <Route path="reports" element={<Reports />} />
          </Route>
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;

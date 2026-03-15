import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  CheckCircle2,
  Copy,
  Gamepad2,
  Music2,
  Pause,
  Play,
  RotateCcw,
  Settings,
  Trophy,
  Users,
} from 'lucide-react';
import { Badge } from './components/ui/badge';
import { Button } from './components/ui/button';
import { Card } from './components/ui/card';
import type { DifficultyMode, Game, Guess, GuessDirection, MusicProviderType, RoundResult, Song, Team } from './types';
import { seedSongs } from './data/mockSongs';
import { providerAdapters } from './services/providers';
import {
  detectWinner,
  nextTeamInOrder,
  normalize,
  orderCards,
  pickNextSong,
  revealSummary,
  validateHigherLower,
} from './game/engine';

const createInitialTeams = (): Team[] => [
  {
    id: 'team-neon',
    name: 'Neon Notes',
    players: [
      { id: 'player-ari', name: 'Ari', joinedFromDevice: true },
      { id: 'player-jules', name: 'Jules', joinedFromDevice: false },
    ],
    cards: [],
    streak: 0,
    misses: 0,
    cardsEarned: 0,
  },
  {
    id: 'team-bassline',
    name: 'Bassline Crew',
    players: [
      { id: 'player-sam', name: 'Sam', joinedFromDevice: true },
      { id: 'player-kai', name: 'Kai', joinedFromDevice: false },
    ],
    cards: [],
    streak: 0,
    misses: 0,
    cardsEarned: 0,
  },
];

function createInitialGame(): Game {
  return {
    id: 'demo-chronotunes-room',
    status: 'setup',
    hostName: 'Host DJ Nova',
    selectedProvider: 'spotify',
    providers: [
      { id: 'spotify', name: 'Spotify', authenticated: true, connectedAccountName: 'nova.spotify' },
      { id: 'youtube', name: 'YouTube Music', authenticated: false, connectedAccountName: '' },
    ],
    familyFriendlyMode: true,
    allowObscureTracks: false,
    winCondition: 10,
    difficultyMode: 'balanced',
    teams: createInitialTeams(),
    joinCode: 'CHRONO10',
    joinUrl: 'https://chronotunes.app/join/CHRONO10',
    usedSongIds: [],
    roundHistory: [],
    currentTurn: null,
    winnerTeamId: null,
  };
}

function App() {
  const [catalog] = useState<Song[]>(seedSongs);
  const [game, setGame] = useState<Game>(createInitialGame);
  const [copiedJoinUrl, setCopiedJoinUrl] = useState(false);
  const [showCompanion, setShowCompanion] = useState(false);
  const [roundModal, setRoundModal] = useState<RoundResult | null>(null);
  const [guess, setGuess] = useState<Guess>({
    direction: 'higher',
    compareCardId: '',
    titleGuess: '',
    artistGuess: '',
    yearGuess: 2000,
  });

  const teamsById = useMemo(() => Object.fromEntries(game.teams.map((team) => [team.id, team])), [game.teams]);
  const activeTeam = game.currentTurn ? teamsById[game.currentTurn.teamId] : null;
  const winner = game.winnerTeamId ? teamsById[game.winnerTeamId] : null;

  const applyProviderSelection = async (provider: MusicProviderType) => {
    const auth = await providerAdapters[provider].authenticate();
    setGame((prev) => ({
      ...prev,
      selectedProvider: provider,
      providers: prev.providers.map((item) => ({
        ...item,
        authenticated: item.id === provider,
        connectedAccountName: item.id === provider ? auth.connectedAccountName : item.connectedAccountName,
      })),
    }));
  };

  const setupDemoGame = () => {
    setGame((prev) => {
      const seededTeams = prev.teams.map((team, index) => ({ ...team, cards: [catalog[index]] }));
      const firstTurnTeam = [...seededTeams].sort((a, b) => b.cards[0].year - a.cards[0].year)[0];
      const usedSongIds = seededTeams.flatMap((team) => team.cards.map((card) => card.id));
      const nextSong = pickNextSong(catalog, { ...prev, teams: seededTeams, usedSongIds });
      return {
        ...prev,
        status: 'lobby',
        teams: seededTeams.map((team) => ({ ...team, cards: orderCards(team.cards) })),
        usedSongIds,
        currentTurn: { number: 1, teamId: firstTurnTeam.id, song: nextSong },
      };
    });
    setGuess((prev) => ({ ...prev, compareCardId: catalog[1]?.id ?? '' }));
  };

  const startGame = () => setGame((prev) => ({ ...prev, status: 'playing' }));
  const pauseResumeGame = () => setGame((prev) => ({ ...prev, status: prev.status === 'paused' ? 'playing' : 'paused' }));

  const restartGame = () => {
    setGame(createInitialGame());
    setRoundModal(null);
    setGuess({ direction: 'higher', compareCardId: '', titleGuess: '', artistGuess: '', yearGuess: 2000 });
  };

  const copyJoinUrl = async () => {
    await navigator.clipboard.writeText(game.joinUrl);
    setCopiedJoinUrl(true);
    setTimeout(() => setCopiedJoinUrl(false), 1200);
  };

  const submitTurn = () => {
    if (!game.currentTurn || !activeTeam) return;

    const comparedCard = activeTeam.cards.find((card) => card.id === guess.compareCardId);
    if (!comparedCard) return;

    const placementCorrect = validateHigherLower(game.currentTurn.song.year, comparedCard.year, guess.direction);
    const titleCorrect = normalize(guess.titleGuess) === normalize(game.currentTurn.song.title);
    const artistCorrect = normalize(guess.artistGuess) === normalize(game.currentTurn.song.artist);
    const yearCorrect = guess.yearGuess === game.currentTurn.song.year;

    const result: RoundResult = {
      turnNumber: game.currentTurn.number,
      teamId: activeTeam.id,
      song: game.currentTurn.song,
      guess,
      placementCorrect,
      titleCorrect,
      artistCorrect,
      yearCorrect,
      cardEarned: placementCorrect,
    };

    setGame((prev) => {
      const updatedTeams = prev.teams.map((team) => {
        if (team.id !== activeTeam.id) return team;
        const cards = result.cardEarned ? orderCards([...team.cards, result.song]) : team.cards;
        return {
          ...team,
          cards,
          streak: result.cardEarned ? team.streak + 1 : 0,
          misses: result.cardEarned ? team.misses : team.misses + 1,
          cardsEarned: result.cardEarned ? team.cardsEarned + 1 : team.cardsEarned,
        };
      });

      const usedSongIds = [...prev.usedSongIds, result.song.id];
      const foundWinner = detectWinner(updatedTeams, prev.winCondition);

      if (foundWinner) {
        return {
          ...prev,
          status: 'finished',
          teams: updatedTeams,
          usedSongIds,
          roundHistory: [result, ...prev.roundHistory],
          winnerTeamId: foundWinner.id,
        };
      }

      const nextTeam = nextTeamInOrder(updatedTeams, activeTeam.id);
      const nextSong = pickNextSong(catalog, { ...prev, teams: updatedTeams, usedSongIds });

      return {
        ...prev,
        teams: updatedTeams,
        usedSongIds,
        roundHistory: [result, ...prev.roundHistory],
        currentTurn: {
          number: prev.currentTurn ? prev.currentTurn.number + 1 : 1,
          teamId: nextTeam.id,
          song: nextSong,
        },
      };
    });

    setRoundModal(result);
    setGuess({ direction: 'higher', compareCardId: '', titleGuess: '', artistGuess: '', yearGuess: 2000 });
  };

  return (
    <div className="mx-auto min-h-screen max-w-7xl space-y-4 p-4 md:p-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-black tracking-tight">ChronoTunes</h1>
          <p className="text-slate-300">Team music guessing showdown with timeline strategy.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={pauseResumeGame}><Pause className="mr-2 inline size-4" />Pause / Resume</Button>
          <Button variant="danger" onClick={restartGame}><RotateCcw className="mr-2 inline size-4" />Restart</Button>
        </div>
      </header>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="space-y-4 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold"><Settings className="mr-2 inline size-5" />Landing / Host Setup</h2>
            <Badge>{game.status.toUpperCase()}</Badge>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <Card>
              <h3 className="font-semibold">Music provider selection</h3>
              <p className="mb-3 mt-1 text-xs text-slate-400">Mock auth today, adapter swap to real APIs later.</p>
              <div className="space-x-2">
                {game.providers.map((provider) => (
                  <Button
                    key={provider.id}
                    variant={game.selectedProvider === provider.id ? 'default' : 'outline'}
                    onClick={() => void applyProviderSelection(provider.id)}
                  >
                    {provider.name}
                  </Button>
                ))}
              </div>
              <p className="mt-2 text-xs text-cyan-300">
                Connected: {game.providers.find((provider) => provider.id === game.selectedProvider)?.connectedAccountName || 'Not connected'}
              </p>
            </Card>

            <Card>
              <h3 className="font-semibold">Safety / difficulty</h3>
              <label className="mt-2 flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={game.familyFriendlyMode}
                  onChange={(event) => setGame((prev) => ({ ...prev, familyFriendlyMode: event.target.checked }))}
                />
                Family friendly mode
              </label>
              <label className="mt-2 flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={game.allowObscureTracks}
                  onChange={(event) => setGame((prev) => ({ ...prev, allowObscureTracks: event.target.checked }))}
                />
                Allow obscure tracks
              </label>
              <div className="mt-2 text-sm">
                <span>Decade weighting</span>
                <select
                  className="mt-1 w-full rounded-lg border border-slate-600 bg-slate-900 p-2"
                  value={game.difficultyMode}
                  onChange={(event) => setGame((prev) => ({ ...prev, difficultyMode: event.target.value as DifficultyMode }))}
                >
                  <option value="balanced">Balanced</option>
                  <option value="chaotic">Chaotic random</option>
                  <option value="modern-heavy">Modern-heavy</option>
                  <option value="classics-heavy">Classics-heavy</option>
                </select>
              </div>
              <div className="mt-2 text-sm">
                <span>Win condition</span>
                <input
                  type="number"
                  min={3}
                  max={15}
                  value={game.winCondition}
                  className="mt-1 w-full rounded-lg border border-slate-600 bg-slate-900 p-2"
                  onChange={(event) => setGame((prev) => ({ ...prev, winCondition: Number(event.target.value) || 10 }))}
                />
              </div>
            </Card>
          </div>

          <Card>
            <div className="mb-2 flex items-center justify-between">
              <h3 className="font-semibold"><Users className="mr-2 inline size-4" />Team creation & player management</h3>
              <Button
                variant="outline"
                onClick={() =>
                  setGame((prev) => ({
                    ...prev,
                    teams: [
                      ...prev.teams,
                      {
                        id: crypto.randomUUID(),
                        name: `Team ${prev.teams.length + 1}`,
                        players: [],
                        cards: [],
                        streak: 0,
                        misses: 0,
                        cardsEarned: 0,
                      },
                    ],
                  }))
                }
              >
                Add team
              </Button>
            </div>
            <div className="grid gap-2 md:grid-cols-2">
              {game.teams.map((team) => (
                <div key={team.id} className="rounded-xl border border-slate-700 p-3">
                  <p className="font-semibold">{team.name}</p>
                  <p className="text-xs text-slate-400">
                    {team.players.length > 0
                      ? team.players.map((player) => `${player.name}${player.joinedFromDevice ? ' 📱' : ''}`).join(', ')
                      : 'No players yet'}
                  </p>
                </div>
              ))}
            </div>
          </Card>

          {game.status === 'setup' && <Button onClick={setupDemoGame}><Play className="mr-2 inline size-4" />Create demo game / open lobby</Button>}
          {game.status === 'lobby' && <Button onClick={startGame}><Play className="mr-2 inline size-4" />Start game</Button>}
        </Card>

        <Card className="space-y-3">
          <h2 className="font-bold"><Gamepad2 className="mr-2 inline size-5" />Game Lobby</h2>
          <p className="text-sm text-slate-300">Join code: <span className="font-semibold text-cyan-300">{game.joinCode}</span></p>
          <div className="rounded-lg bg-slate-950 p-2 text-xs">{game.joinUrl}</div>
          <Button variant="outline" onClick={copyJoinUrl}><Copy className="mr-2 inline size-4" />{copiedJoinUrl ? 'Join URL copied' : 'Copy Join URL'}</Button>

          <h3 className="font-semibold">Score to {game.winCondition}</h3>
          <div className="space-y-2">
            {game.teams.map((team) => (
              <div key={team.id}>
                <div className="mb-1 flex justify-between text-xs">
                  <span>{team.name}</span>
                  <span>{team.cards.length}/{game.winCondition}</span>
                </div>
                <div className="h-2 rounded-full bg-slate-700">
                  <div className="h-2 rounded-full bg-cyan-400" style={{ width: `${(team.cards.length / game.winCondition) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>

          <Button variant="ghost" onClick={() => setShowCompanion((prev) => !prev)}>Toggle player companion view</Button>
          {showCompanion && (
            <Card className="bg-slate-950">
              <p className="text-sm font-semibold">Player companion</p>
              <p className="text-xs text-slate-400">Players can see team turn, score progress, and latest reveal on their own device.</p>
              {game.roundHistory[0] && <p className="mt-1 text-xs text-cyan-300">Latest: {revealSummary(game.roundHistory[0])}</p>}
            </Card>
          )}
        </Card>
      </div>

      {game.currentTurn && ['playing', 'paused', 'finished'].includes(game.status) && (
        <div className="grid gap-4 lg:grid-cols-3">
          <Card className="space-y-3 lg:col-span-2">
            <h2 className="font-bold">Active turn screen</h2>
            <p className="text-sm text-slate-300">Turn #{game.currentTurn.number} • Team: <span className="font-semibold text-cyan-300">{activeTeam?.name}</span></p>
            <Card className="bg-slate-950">
              <p className="font-semibold"><Music2 className="mr-2 inline size-4" />Track preview</p>
              <p className="text-xs text-slate-400 break-all">{game.currentTurn.song.previewUrl}</p>
            </Card>
            <div className="grid gap-2 md:grid-cols-2">
              <select
                className="rounded-lg border border-slate-600 bg-slate-900 p-2"
                value={guess.compareCardId}
                onChange={(event) => setGuess((prev) => ({ ...prev, compareCardId: event.target.value }))}
              >
                <option value="">Choose card to compare</option>
                {activeTeam?.cards.map((card) => (
                  <option key={card.id} value={card.id}>{card.title} ({card.year})</option>
                ))}
              </select>
              <select
                className="rounded-lg border border-slate-600 bg-slate-900 p-2"
                value={guess.direction}
                onChange={(event) => setGuess((prev) => ({ ...prev, direction: event.target.value as GuessDirection }))}
              >
                <option value="higher">Higher year</option>
                <option value="lower">Lower year</option>
              </select>
              <input
                className="rounded-lg border border-slate-600 bg-slate-900 p-2"
                placeholder="Exact title guess"
                value={guess.titleGuess}
                onChange={(event) => setGuess((prev) => ({ ...prev, titleGuess: event.target.value }))}
              />
              <input
                className="rounded-lg border border-slate-600 bg-slate-900 p-2"
                placeholder="Exact artist guess"
                value={guess.artistGuess}
                onChange={(event) => setGuess((prev) => ({ ...prev, artistGuess: event.target.value }))}
              />
              <input
                type="number"
                className="rounded-lg border border-slate-600 bg-slate-900 p-2 md:col-span-2"
                placeholder="Exact year guess"
                value={guess.yearGuess}
                onChange={(event) => setGuess((prev) => ({ ...prev, yearGuess: Number(event.target.value) || 0 }))}
              />
            </div>
            <Button disabled={game.status !== 'playing' || !guess.compareCardId} onClick={submitTurn}>Submit turn</Button>
          </Card>

          <Card>
            <h2 className="font-bold">Team card timeline</h2>
            <div className="space-y-3">
              {game.teams.map((team) => (
                <div key={team.id} className="rounded-xl border border-slate-700 p-3">
                  <p className="font-semibold">{team.name}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {team.cards.length > 0
                      ? team.cards.map((card) => <Badge key={card.id}>{card.year} · {card.title}</Badge>)
                      : <span className="text-xs text-slate-400">No cards yet.</span>}
                  </div>
                  <p className="mt-2 text-xs text-slate-400">Streak {team.streak} · Misses {team.misses} · Cards earned {team.cardsEarned}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      <Card>
        <h2 className="font-bold">Round history</h2>
        <div className="mt-2 space-y-2 text-sm">
          {game.roundHistory.length === 0 && <p className="text-slate-400">No rounds yet.</p>}
          {game.roundHistory.map((round) => (
            <div key={round.turnNumber} className="rounded-lg border border-slate-700 p-2">
              Turn {round.turnNumber} · {teamsById[round.teamId]?.name} · {revealSummary(round)} · placement {round.placementCorrect ? '✅' : '❌'}
            </div>
          ))}
        </div>
      </Card>

      <AnimatePresence>
        {roundModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-30 grid place-items-center bg-black/70 p-4">
            <motion.div initial={{ y: 22 }} animate={{ y: 0 }} className="w-full max-w-lg rounded-2xl border border-slate-700 bg-slate-900 p-5">
              <h3 className="text-xl font-bold">Round result modal</h3>
              <p className="mt-1 text-slate-300">Reveal: {revealSummary(roundModal)}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Badge className={roundModal.placementCorrect ? 'border-emerald-400/40 bg-emerald-500/10' : ''}>Placement {roundModal.placementCorrect ? 'correct' : 'wrong'}</Badge>
                <Badge>{roundModal.titleCorrect ? 'Title ✔' : 'Title ✘'}</Badge>
                <Badge>{roundModal.artistCorrect ? 'Artist ✔' : 'Artist ✘'}</Badge>
                <Badge>{roundModal.yearCorrect ? 'Year ✔' : 'Year ✘'}</Badge>
              </div>
              <Button className="mt-4" onClick={() => setRoundModal(null)}>Continue</Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {winner && (
        <Card className="border-amber-400/60 bg-amber-500/10 text-center">
          <Trophy className="mx-auto size-8 text-amber-300" />
          <h2 className="mt-1 text-2xl font-black">Final winner screen: {winner.name}</h2>
          <p className="text-sm">Reached {game.winCondition} cards first.</p>
          <CheckCircle2 className="mx-auto mt-2 size-5 text-emerald-300" />
        </Card>
      )}
    </div>
  );
}

export default App;

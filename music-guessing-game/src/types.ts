export type MusicProviderType = 'spotify' | 'youtube';
export type GameStatus = 'setup' | 'lobby' | 'playing' | 'paused' | 'finished';
export type GuessDirection = 'higher' | 'lower';
export type DifficultyMode = 'balanced' | 'chaotic' | 'modern-heavy' | 'classics-heavy';

export type MusicProvider = {
  id: MusicProviderType;
  name: string;
  authenticated: boolean;
  connectedAccountName: string;
};

export type Song = {
  id: string;
  title: string;
  artist: string;
  year: number;
  decade: number;
  popularity: number;
  explicit: boolean;
  previewUrl: string;
  genre: string;
};

export type SongCard = Pick<Song, 'id' | 'title' | 'artist' | 'year'>;

export type Player = {
  id: string;
  name: string;
  joinedFromDevice: boolean;
};

export type Team = {
  id: string;
  name: string;
  players: Player[];
  cards: SongCard[];
  streak: number;
  misses: number;
  cardsEarned: number;
};

export type Guess = {
  direction: GuessDirection;
  compareCardId: string;
  titleGuess: string;
  artistGuess: string;
  yearGuess: number;
};

export type RoundResult = {
  turnNumber: number;
  teamId: string;
  song: Song;
  guess: Guess;
  placementCorrect: boolean;
  titleCorrect: boolean;
  artistCorrect: boolean;
  yearCorrect: boolean;
  cardEarned: boolean;
};

export type Turn = {
  number: number;
  teamId: string;
  song: Song;
};

export type Game = {
  id: string;
  status: GameStatus;
  hostName: string;
  selectedProvider: MusicProviderType;
  providers: MusicProvider[];
  familyFriendlyMode: boolean;
  allowObscureTracks: boolean;
  winCondition: number;
  difficultyMode: DifficultyMode;
  teams: Team[];
  joinCode: string;
  joinUrl: string;
  usedSongIds: string[];
  roundHistory: RoundResult[];
  currentTurn: Turn | null;
  winnerTeamId: string | null;
};

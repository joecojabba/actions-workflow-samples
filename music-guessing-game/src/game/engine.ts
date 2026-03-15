import type { DifficultyMode, Game, GuessDirection, RoundResult, Song, SongCard, Team } from '../types';

export const normalize = (value: string) => value.trim().toLowerCase();
export const orderCards = (cards: SongCard[]) => [...cards].sort((a, b) => a.year - b.year);

export const validateHigherLower = (songYear: number, compareYear: number, direction: GuessDirection) =>
  direction === 'higher' ? songYear > compareYear : songYear < compareYear;

export const detectWinner = (teams: Team[], winCondition: number) =>
  teams.find((team) => team.cards.length >= winCondition) ?? null;

const weightByDifficulty = (songs: Song[], difficultyMode: DifficultyMode): Song[] => {
  if (difficultyMode === 'chaotic') return songs;
  if (difficultyMode === 'modern-heavy') return songs.filter((song) => song.year >= 1990).concat(songs.filter((song) => song.year < 1990));
  if (difficultyMode === 'classics-heavy') return songs.filter((song) => song.year < 1990).concat(songs.filter((song) => song.year >= 1990));
  return [...songs].sort((a, b) => a.decade - b.decade || b.popularity - a.popularity);
};

export function pickNextSong(catalog: Song[], game: Game): Song {
  const filtered = catalog.filter((song) => {
    if (game.usedSongIds.includes(song.id)) return false;
    if (game.familyFriendlyMode && song.explicit) return false;
    if (!game.allowObscureTracks && song.popularity < 65) return false;
    return true;
  });

  const weighted = weightByDifficulty(filtered, game.difficultyMode);
  if (!weighted.length) {
    throw new Error('No eligible songs available for this game settings combination.');
  }

  const randomRange = Math.min(5, weighted.length);
  return weighted[Math.floor(Math.random() * randomRange)];
}

export const revealSummary = (result: RoundResult) =>
  `${result.song.title} — ${result.song.artist} (${result.song.year})`;

export const nextTeamInOrder = (teams: Team[], currentTeamId: string) => {
  const idx = teams.findIndex((team) => team.id === currentTeamId);
  return teams[(idx + 1) % teams.length];
};

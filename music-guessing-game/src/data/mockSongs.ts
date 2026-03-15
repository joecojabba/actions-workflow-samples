import type { Song } from '../types';

const raw: Array<[string, string, string, number, string]> = [
  ['stardust', 'Stardust', 'Hoagy Carmichael', 1927, 'Jazz'],
  ['summertime', 'Summertime', 'Ella Fitzgerald & Louis Armstrong', 1958, 'Jazz'],
  ['respect', 'Respect', 'Aretha Franklin', 1967, 'Soul'],
  ['dancing-queen', 'Dancing Queen', 'ABBA', 1976, 'Pop'],
  ['billie-jean', 'Billie Jean', 'Michael Jackson', 1982, 'Pop'],
  ['smells-like-teen-spirit', 'Smells Like Teen Spirit', 'Nirvana', 1991, 'Rock'],
  ['hey-ya', 'Hey Ya!', 'Outkast', 2003, 'Hip-Hop'],
  ['firework', 'Firework', 'Katy Perry', 2010, 'Pop'],
  ['cant-stop-the-feeling', "Can't Stop the Feeling!", 'Justin Timberlake', 2016, 'Pop'],
  ['blinding-lights', 'Blinding Lights', 'The Weeknd', 2019, 'Pop'],
  ['as-it-was', 'As It Was', 'Harry Styles', 2022, 'Pop'],
  ['flowers', 'Flowers', 'Miley Cyrus', 2023, 'Pop'],
  ['take-five', 'Take Five', 'The Dave Brubeck Quartet', 1959, 'Jazz'],
  ['bohemian-rhapsody', 'Bohemian Rhapsody', 'Queen', 1975, 'Rock'],
  ['rolling-in-the-deep', 'Rolling in the Deep', 'Adele', 2010, 'Pop'],
  ['happy', 'Happy', 'Pharrell Williams', 2013, 'Pop'],
];

export const seedSongs: Song[] = raw.map(([id, title, artist, year, genre], idx) => ({
  id,
  title,
  artist,
  year,
  decade: Math.floor(year / 10) * 10,
  popularity: 99 - idx,
  explicit: false,
  previewUrl: `https://example.com/previews/${id}.mp3`,
  genre,
}));

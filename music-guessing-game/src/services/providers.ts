import type { MusicProviderType, Song } from '../types';
import { seedSongs } from '../data/mockSongs';

export type ProviderAdapter = {
  provider: MusicProviderType;
  authenticate: () => Promise<{ connectedAccountName: string }>;
  fetchCatalog: () => Promise<Song[]>;
};

const mockAuth = async (provider: MusicProviderType) => ({
  connectedAccountName: provider === 'spotify' ? 'host@spotify-demo' : 'host@ytmusic-demo',
});

const mockCatalog = async () => seedSongs;

export const spotifyAdapter: ProviderAdapter = {
  provider: 'spotify',
  authenticate: () => mockAuth('spotify'),
  fetchCatalog: mockCatalog,
};

export const youtubeMusicAdapter: ProviderAdapter = {
  provider: 'youtube',
  authenticate: () => mockAuth('youtube'),
  fetchCatalog: mockCatalog,
};

export const providerAdapters: Record<MusicProviderType, ProviderAdapter> = {
  spotify: spotifyAdapter,
  youtube: youtubeMusicAdapter,
};

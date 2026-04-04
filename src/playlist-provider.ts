import type { PlaylistProvider } from '@nuclearplayer/plugin-sdk';

import type { HiFiClient } from './client';
import { PLAYLIST_PROVIDER_ID, PLAYLIST_PROVIDER_NAME } from './config';
import { mapHiFiPlaylistToPlaylist } from './mappers';

const isTidalPlaylistUrl = (url: string): boolean => {
  try {
    const parsed = new URL(url);
    return (
      parsed.hostname === 'tidal.com' &&
      parsed.pathname.startsWith('/browse/playlist/')
    );
  } catch {
    return false;
  }
};

const extractPlaylistUuid = (url: string): string => {
  const parsed = new URL(url);
  const segments = parsed.pathname.split('/').filter(Boolean);
  return segments[2];
};

export const createPlaylistProvider = (
  client: HiFiClient,
): PlaylistProvider => ({
  id: PLAYLIST_PROVIDER_ID,
  kind: 'playlists',
  name: PLAYLIST_PROVIDER_NAME,
  matchesUrl: isTidalPlaylistUrl,
  async fetchPlaylistByUrl(url: string) {
    const uuid = extractPlaylistUuid(url);
    const response = await client.getPlaylist(uuid);
    return mapHiFiPlaylistToPlaylist(response);
  },
});

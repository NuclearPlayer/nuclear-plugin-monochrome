import type { StreamingProvider } from '@nuclearplayer/plugin-sdk';

import type { HiFiClient } from './client';
import { METADATA_PROVIDER_ID, STREAMING_PROVIDER_ID } from './config';
import { mapTidalTrackToStreamCandidate, resolveManifest } from './mappers';

const STREAMING_SEARCH_LIMIT = 5;

export const createStreamingProvider = (
  client: HiFiClient,
): StreamingProvider => ({
  id: STREAMING_PROVIDER_ID,
  kind: 'streaming',
  name: 'Monochrome',

  searchForTrack: async (artist, title) => {
    const response = await client.searchTracks(
      `${artist} ${title}`,
      STREAMING_SEARCH_LIMIT,
    );
    return response.data.items.map(mapTidalTrackToStreamCandidate);
  },

  getStreamUrl: async (candidateId) => {
    const playback = await client.getTrackPlayback(Number(candidateId));
    const manifest = resolveManifest(playback.data);

    return {
      url: manifest.urls[0],
      protocol: 'https',
      mimeType: manifest.mimeType,
      source: {
        provider: METADATA_PROVIDER_ID,
        id: candidateId,
      },
    };
  },
});

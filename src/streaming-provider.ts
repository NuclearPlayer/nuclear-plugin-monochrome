import type { StreamingProvider } from '@nuclearplayer/plugin-sdk';

import type { MonochromeClient } from './client';
import { METADATA_PROVIDER_ID, STREAMING_PROVIDER_ID } from './config';
import { mapSearchTrackToStreamCandidate } from './mappers';

const STREAMING_SEARCH_LIMIT = 5;

export const createStreamingProvider = (
  client: MonochromeClient,
): StreamingProvider => ({
  id: STREAMING_PROVIDER_ID,
  kind: 'streaming',
  name: 'Monochrome',

  searchForTrack: async (artist, title) => {
    const response = await client.searchTracks(
      `${artist} ${title}`,
      STREAMING_SEARCH_LIMIT,
    );
    return response.tracks.map(mapSearchTrackToStreamCandidate);
  },

  getStreamUrl: async (candidateId) => ({
    url: client.streamUrl(candidateId),
    protocol: 'https',
    mimeType: 'audio/flac',
    source: {
      provider: METADATA_PROVIDER_ID,
      id: candidateId,
    },
  }),
});

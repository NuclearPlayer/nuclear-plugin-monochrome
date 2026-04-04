import type { MetadataProvider } from '@nuclearplayer/plugin-sdk';

import type { HiFiClient } from './client';
import { METADATA_PROVIDER_ID, STREAMING_PROVIDER_ID } from './config';
import {
  mapTidalAlbumToAlbum,
  mapTidalAlbumToAlbumRef,
  mapTidalArtistToArtistRef,
  mapTidalTrackToTrack,
} from './mappers';

export const createMetadataProvider = (
  client: HiFiClient,
): MetadataProvider => ({
  id: METADATA_PROVIDER_ID,
  kind: 'metadata',
  name: 'Monochrome',
  streamingProviderId: STREAMING_PROVIDER_ID,
  searchCapabilities: ['artists', 'albums', 'tracks'],
  albumMetadataCapabilities: ['albumDetails'],

  searchArtists: async (params) => {
    const response = await client.searchArtists(params.query, params.limit);
    return response.data.artists.items.map(mapTidalArtistToArtistRef);
  },

  searchAlbums: async (params) => {
    const response = await client.searchAlbums(params.query, params.limit);
    return response.data.albums.items.map(mapTidalAlbumToAlbumRef);
  },

  searchTracks: async (params) => {
    const response = await client.searchTracks(params.query, params.limit);
    return response.data.items.map(mapTidalTrackToTrack);
  },

  fetchAlbumDetails: async (albumId) => {
    const response = await client.getAlbum(Number(albumId));
    return mapTidalAlbumToAlbum(response.data);
  },
});

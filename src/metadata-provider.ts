import type { MetadataProvider } from '@nuclearplayer/plugin-sdk';

import type { HiFiClient } from './client';
import {
  ARTIST_TOP_TRACKS_LIMIT,
  METADATA_PROVIDER_ID,
  STREAMING_PROVIDER_ID,
} from './config';
import {
  deduplicateAlbums,
  mapTidalAlbumToAlbum,
  mapTidalAlbumToAlbumRef,
  mapTidalArtistToArtistRef,
  mapTidalSimilarArtistToArtistRef,
  mapTidalTrackToTrack,
  mapTidalTrackToTrackRef,
} from './mappers';

export const createMetadataProvider = (
  client: HiFiClient,
): MetadataProvider => ({
  id: METADATA_PROVIDER_ID,
  kind: 'metadata',
  name: 'Monochrome',
  streamingProviderId: STREAMING_PROVIDER_ID,
  searchCapabilities: ['artists', 'albums', 'tracks'],
  artistMetadataCapabilities: [
    'artistAlbums',
    'artistTopTracks',
    'artistRelatedArtists',
  ],
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

  fetchArtistAlbums: async (artistId) => {
    const response = await client.getArtistOverview(Number(artistId));
    return deduplicateAlbums(response.albums.items).map(
      mapTidalAlbumToAlbumRef,
    );
  },

  fetchArtistTopTracks: async (artistId) => {
    const response = await client.getArtistOverview(Number(artistId));
    return response.tracks
      .slice(0, ARTIST_TOP_TRACKS_LIMIT)
      .map(mapTidalTrackToTrackRef);
  },

  fetchArtistRelatedArtists: async (artistId) => {
    const response = await client.getSimilarArtists(Number(artistId));
    return response.artists.map(mapTidalSimilarArtistToArtistRef);
  },

  fetchAlbumDetails: async (albumId) => {
    const response = await client.getAlbum(Number(albumId));
    return mapTidalAlbumToAlbum(response.data);
  },
});

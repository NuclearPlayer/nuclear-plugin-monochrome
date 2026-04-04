import type { MetadataProvider } from '@nuclearplayer/plugin-sdk';

import type { HiFiClient } from './client';
import { METADATA_PROVIDER_ID, STREAMING_PROVIDER_ID } from './config';
import {
  mapArtistInfoToArtistBio,
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
    'artistBio',
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

  fetchArtistBio: async (artistId) => {
    const response = await client.getArtist(Number(artistId));
    return mapArtistInfoToArtistBio(response);
  },

  fetchArtistAlbums: async (artistId) => {
    const response = await client.getArtistDiscography(Number(artistId));
    return response.albums.items.map(mapTidalAlbumToAlbumRef);
  },

  fetchArtistTopTracks: async (artistId) => {
    const response = await client.getArtistTopTracks(Number(artistId));
    return response.tracks.map(mapTidalTrackToTrackRef);
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

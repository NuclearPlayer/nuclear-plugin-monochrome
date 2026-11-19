import type { MetadataProvider } from '@nuclearplayer/plugin-sdk';

import type { MonochromeClient } from './client';
import { METADATA_PROVIDER_ID, STREAMING_PROVIDER_ID } from './config';
import {
  mapReleaseToAlbum,
  mapReleaseToAlbumRef,
  mapSearchArtistToArtistRef,
  mapSearchReleaseToAlbumRef,
  mapSearchTrackToTrack,
  mapTrackToTrackRef,
} from './mappers';

export const createMetadataProvider = (
  client: MonochromeClient,
): MetadataProvider => ({
  id: METADATA_PROVIDER_ID,
  kind: 'metadata',
  name: 'Monochrome',
  streamingProviderId: STREAMING_PROVIDER_ID,
  searchCapabilities: ['artists', 'albums', 'tracks'],
  artistMetadataCapabilities: ['artistAlbums', 'artistTopTracks'],
  albumMetadataCapabilities: ['albumDetails'],

  searchArtists: async (params) => {
    const response = await client.searchArtists(params.query, params.limit);
    return response.artists.map(mapSearchArtistToArtistRef);
  },

  searchAlbums: async (params) => {
    const response = await client.searchReleases(params.query, params.limit);
    return response.releases.map(mapSearchReleaseToAlbumRef);
  },

  searchTracks: async (params) => {
    const response = await client.searchTracks(params.query, params.limit);
    return response.tracks.map(mapSearchTrackToTrack);
  },

  fetchArtistAlbums: async (artistId) => {
    const artist = await client.getArtist(artistId);
    return artist.releases.map(mapReleaseToAlbumRef);
  },

  fetchArtistTopTracks: async (artistId) => {
    const artist = await client.getArtist(artistId);
    return artist.topTracks.map(mapTrackToTrackRef);
  },

  fetchAlbumDetails: async (albumId) => {
    const release = await client.getRelease(albumId);
    return mapReleaseToAlbum(release);
  },
});

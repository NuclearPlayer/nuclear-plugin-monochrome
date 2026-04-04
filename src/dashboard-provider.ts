import type { DashboardProvider } from '@nuclearplayer/plugin-sdk';

import type { HiFiClient } from './client';
import { DASHBOARD_PROVIDER_ID, METADATA_PROVIDER_ID } from './config';
import {
  mapTidalAlbumToAlbumRef,
  mapTidalPlaylistToPlaylistRef,
  mapTidalTrackToTrack,
} from './mappers';
import type { TidalAlbum } from './types';

const NEW_ALBUMS_SECTION_TITLE = 'New Albums';

export const createDashboardProvider = (
  client: HiFiClient,
): DashboardProvider => ({
  id: DASHBOARD_PROVIDER_ID,
  kind: 'dashboard',
  name: 'Monochrome',
  metadataProviderId: METADATA_PROVIDER_ID,
  capabilities: ['topTracks', 'topAlbums', 'editorialPlaylists', 'newReleases'],

  async fetchTopTracks() {
    const dashboard = await client.getDashboard();
    return dashboard.top_tracks.map(mapTidalTrackToTrack);
  },

  async fetchTopAlbums() {
    const dashboard = await client.getDashboard();
    return dashboard.top_albums.map(mapTidalAlbumToAlbumRef);
  },

  async fetchEditorialPlaylists() {
    const dashboard = await client.getDashboard();
    return dashboard.featured_playlists.map(mapTidalPlaylistToPlaylistRef);
  },

  async fetchNewReleases() {
    const dashboard = await client.getDashboard();
    const newAlbumsSection = dashboard.sections.find(
      (section) => section.title === NEW_ALBUMS_SECTION_TITLE,
    );

    if (!newAlbumsSection) {
      return [];
    }

    return (newAlbumsSection.items as TidalAlbum[]).map(
      mapTidalAlbumToAlbumRef,
    );
  },
});

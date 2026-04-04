import type {
  NuclearPlugin,
  NuclearPluginAPI,
} from '@nuclearplayer/plugin-sdk';

import { HiFiClient } from './client';
import {
  DASHBOARD_PROVIDER_ID,
  METADATA_PROVIDER_ID,
  PLAYLIST_PROVIDER_ID,
  STREAMING_PROVIDER_ID,
} from './config';
import { createDashboardProvider } from './dashboard-provider';
import { createMetadataProvider } from './metadata-provider';
import { createPlaylistProvider } from './playlist-provider';
import { createStreamingProvider } from './streaming-provider';

const plugin: NuclearPlugin = {
  onEnable(api: NuclearPluginAPI) {
    const client = new HiFiClient(api.Http.fetch);
    api.Providers.register(createMetadataProvider(client));
    api.Providers.register(createStreamingProvider(client));
    api.Providers.register(createDashboardProvider(client));
    api.Providers.register(createPlaylistProvider(client));
  },

  onDisable(api: NuclearPluginAPI) {
    api.Providers.unregister(METADATA_PROVIDER_ID);
    api.Providers.unregister(STREAMING_PROVIDER_ID);
    api.Providers.unregister(DASHBOARD_PROVIDER_ID);
    api.Providers.unregister(PLAYLIST_PROVIDER_ID);
  },
};

export default plugin;

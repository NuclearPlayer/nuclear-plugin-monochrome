import type {
  NuclearPlugin,
  NuclearPluginAPI,
} from '@nuclearplayer/plugin-sdk';

import { HiFiClient } from './client';
import { METADATA_PROVIDER_ID, STREAMING_PROVIDER_ID } from './config';
import { createMetadataProvider } from './metadata-provider';

import { createStreamingProvider } from './streaming-provider';

const plugin: NuclearPlugin = {
  onEnable(api: NuclearPluginAPI) {
    const client = new HiFiClient(api.Http.fetch);
    api.Providers.register(createMetadataProvider(client));
    api.Providers.register(createStreamingProvider(client));
  },

  onDisable(api: NuclearPluginAPI) {
    api.Providers.unregister(METADATA_PROVIDER_ID);
    api.Providers.unregister(STREAMING_PROVIDER_ID);
  },
};

export default plugin;

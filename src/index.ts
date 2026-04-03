import type {
  NuclearPlugin,
  NuclearPluginAPI,
} from '@nuclearplayer/plugin-sdk';

const METADATA_PROVIDER_ID = 'monochrome';
const STREAMING_PROVIDER_ID = 'monochrome-stream';

const plugin: NuclearPlugin = {
  onEnable(api: NuclearPluginAPI) {
    // TODO: register metadata provider
    // TODO: register streaming provider
  },

  onDisable(api: NuclearPluginAPI) {
    api.Providers.unregister(METADATA_PROVIDER_ID);
    api.Providers.unregister(STREAMING_PROVIDER_ID);
  },
};

export default plugin;

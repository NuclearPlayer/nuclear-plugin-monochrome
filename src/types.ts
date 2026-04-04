export type TidalArtistSummary = {
  id: number;
  name: string;
  type: string;
  picture: string | null;
};

export type TidalAlbumSummary = {
  id: number;
  title: string;
  cover: string;
  releaseDate?: string;
};

export type TidalTrack = {
  id: number;
  title: string;
  duration: number;
  trackNumber: number;
  volumeNumber: number;
  isrc: string;
  explicit: boolean;
  audioQuality: string;
  audioModes: string[];
  artist: TidalArtistSummary;
  artists: TidalArtistSummary[];
  album: TidalAlbumSummary;
  version: string | null;
  copyright?: string;
  popularity?: number;
};

export type TidalArtist = {
  id: number;
  name: string;
  picture: string | null;
  popularity: number;
  url?: string;
};

export type TidalAlbum = {
  id: number;
  title: string;
  duration: number;
  numberOfTracks: number;
  numberOfVolumes: number;
  releaseDate: string;
  cover: string;
  explicit: boolean;
  audioQuality: string;
  audioModes: string[];
  mediaMetadata?: { tags: string[] };
  type?: string;
  version: string | null;
  artist: TidalArtistSummary;
  artists: TidalArtistSummary[];
};

export type TidalSimilarArtist = {
  id: number | string;
  name: string;
  picture: string | null;
  popularity?: number;
  url?: string;
};

export type TidalPlaybackInfo = {
  trackId: number;
  audioQuality: string;
  audioMode: string;
  manifestMimeType: string;
  manifest: string;
  bitDepth: number;
  sampleRate: number;
  albumReplayGain: number;
  albumPeakAmplitude: number;
  trackReplayGain: number;
  trackPeakAmplitude: number;
};

export type TidalBtsManifest = {
  mimeType: string;
  codecs: string;
  urls: string[];
};

export type TidalPaginatedList<T> = {
  limit: number;
  offset: number;
  totalNumberOfItems: number;
  items: T[];
};

export type HiFiSearchTracksResponse = {
  version: string;
  data: TidalPaginatedList<TidalTrack>;
};

export type HiFiSearchArtistsResponse = {
  version: string;
  data: {
    artists: TidalPaginatedList<TidalArtist>;
  };
};

export type HiFiSearchAlbumsResponse = {
  version: string;
  data: {
    albums: TidalPaginatedList<TidalAlbum>;
  };
};

export type HiFiTrackInfoResponse = {
  version: string;
  data: TidalTrack;
};

export type HiFiTrackPlaybackResponse = {
  version: string;
  data: TidalPlaybackInfo;
};

export type HiFiAlbumResponse = {
  version: string;
  data: TidalAlbum & {
    items: Array<{ item: TidalTrack; type: 'track' }>;
  };
};

export type HiFiArtistInfoResponse = {
  version: string;
  artist: TidalArtist;
  cover: {
    id: number;
    name: string;
    '750': string;
  } | null;
};

export type HiFiArtistDiscographyResponse = {
  version: string;
  albums: {
    items: TidalAlbum[];
  };
  tracks: TidalTrack[];
};

export type HiFiSimilarArtistsResponse = {
  version: string;
  artists: TidalSimilarArtist[];
};

export type HiFiCoverResponse = {
  version: string;
  covers: Array<{
    id?: number;
    name?: string;
    '1280': string;
    '640': string;
    '80': string;
  }>;
};

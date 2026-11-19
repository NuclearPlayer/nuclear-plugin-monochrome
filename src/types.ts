export type MonochromeArtistSummary = {
  artistId: string;
  name: string;
  avatar: string | null;
};

export type MonochromeSearchTrack = {
  trackId: string;
  title: string;
  artistIds: string[];
  artistNames: string[];
  artwork: string | null;
  duration: number;
};

export type MonochromeTrack = {
  trackId: string;
  title: string;
  artists: MonochromeArtistSummary[];
  artwork: string | null;
};

export type MonochromeSearchRelease = {
  releaseId: string;
  title: string;
  artistIds: string[];
  artistNames: string[];
  artwork: string | null;
};

export type MonochromeRelease = {
  releaseId: string;
  title: string;
  artists: MonochromeArtistSummary[];
  releaseDate: string | null;
  artwork: string | null;
  tracks: MonochromeTrack[];
};

export type MonochromeSearchArtist = {
  artistId: string;
  name: string;
  avatar: string | null;
};

export type MonochromeArtist = {
  artistId: string;
  name: string;
  topTracks: MonochromeTrack[];
  releases: MonochromeRelease[];
};

export type MonochromeTrackSearchResponse = {
  tracks: MonochromeSearchTrack[];
};

export type MonochromeReleaseSearchResponse = {
  releases: MonochromeSearchRelease[];
};

export type MonochromeArtistSearchResponse = {
  artists: MonochromeSearchArtist[];
};

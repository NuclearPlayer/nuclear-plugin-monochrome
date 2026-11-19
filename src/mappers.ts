import type {
  Album,
  AlbumRef,
  ArtistCredit,
  ArtistRef,
  ArtworkSet,
  ProviderRef,
  StreamCandidate,
  Track,
  TrackRef,
} from '@nuclearplayer/plugin-sdk';

import { METADATA_PROVIDER_ID } from './config';
import type {
  MonochromeArtistSummary,
  MonochromeRelease,
  MonochromeSearchArtist,
  MonochromeSearchRelease,
  MonochromeSearchTrack,
  MonochromeTrack,
} from './types';

const makeSource = (id: string): ProviderRef => ({
  provider: METADATA_PROVIDER_ID,
  id,
});

const makeArtworkSet = (url: string | null): ArtworkSet | undefined => {
  if (!url) {
    return undefined;
  }
  return { items: [{ url }] };
};

const mapArtistCredits = (
  artistIds: string[],
  artistNames: string[],
): ArtistCredit[] =>
  artistIds.map((artistId, index) => ({
    name: artistNames[index],
    roles: ['main'],
    source: makeSource(artistId),
  }));

const mapArtistSummaryToArtistRef = (
  artist: MonochromeArtistSummary,
): ArtistRef => ({
  name: artist.name,
  artwork: makeArtworkSet(artist.avatar),
  source: makeSource(artist.artistId),
});

export const mapSearchArtistToArtistRef = (
  artist: MonochromeSearchArtist,
): ArtistRef => ({
  name: artist.name,
  artwork: makeArtworkSet(artist.avatar),
  source: makeSource(artist.artistId),
});

export const mapSearchReleaseToAlbumRef = (
  release: MonochromeSearchRelease,
): AlbumRef => ({
  title: release.title,
  artists: release.artistIds.map((artistId, index) => ({
    name: release.artistNames[index],
    source: makeSource(artistId),
  })),
  artwork: makeArtworkSet(release.artwork),
  source: makeSource(release.releaseId),
});

export const mapReleaseToAlbumRef = (release: MonochromeRelease): AlbumRef => ({
  title: release.title,
  artists: release.artists.map(mapArtistSummaryToArtistRef),
  artwork: makeArtworkSet(release.artwork),
  source: makeSource(release.releaseId),
});

export const mapTrackToTrackRef = (track: MonochromeTrack): TrackRef => ({
  title: track.title,
  artists: track.artists.map(mapArtistSummaryToArtistRef),
  artwork: makeArtworkSet(track.artwork),
  source: makeSource(track.trackId),
});

const mapReleaseDate = (releaseDate: string | null): Album['releaseDate'] => {
  if (!releaseDate) {
    return undefined;
  }
  return { precision: 'day', dateIso: releaseDate };
};

export const mapReleaseToAlbum = (release: MonochromeRelease): Album => ({
  title: release.title,
  artists: release.artists.map((artist) => ({
    name: artist.name,
    roles: ['main'],
    source: makeSource(artist.artistId),
  })),
  tracks: release.tracks.map(mapTrackToTrackRef),
  releaseDate: mapReleaseDate(release.releaseDate),
  artwork: makeArtworkSet(release.artwork),
  source: makeSource(release.releaseId),
});

export const mapSearchTrackToTrack = (track: MonochromeSearchTrack): Track => ({
  title: track.title,
  artists: mapArtistCredits(track.artistIds, track.artistNames),
  durationMs: track.duration,
  artwork: makeArtworkSet(track.artwork),
  source: makeSource(track.trackId),
});

export const mapSearchTrackToStreamCandidate = (
  track: MonochromeSearchTrack,
): StreamCandidate => ({
  id: track.trackId,
  title: `${track.artistNames.join(', ')} - ${track.title}`,
  durationMs: track.duration,
  thumbnail: track.artwork ?? undefined,
  failed: false,
  source: makeSource(track.trackId),
});

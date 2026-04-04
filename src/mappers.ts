import type {
  Album,
  AlbumRef,
  ArtistRef,
  ArtworkSet,
  ProviderRef,
  StreamCandidate,
  Track,
  TrackRef,
} from '@nuclearplayer/plugin-sdk';

import { METADATA_PROVIDER_ID } from './config';
import type {
  HiFiAlbumResponse,
  TidalAlbum,
  TidalArtist,
  TidalArtistSummary,
  TidalBtsManifest,
  TidalPlaybackInfo,
  TidalSimilarArtist,
  TidalTrack,
} from './types';

const TIDAL_IMAGE_BASE = 'https://resources.tidal.com/images';

const coverUrl = (uuid: string, size: number) =>
  `${TIDAL_IMAGE_BASE}/${uuid.replace(/-/g, '/')}/${size}x${size}.jpg`;

const makeSource = (id: number): ProviderRef => ({
  provider: METADATA_PROVIDER_ID,
  id: String(id),
});

const makeArtworkSet = (uuid: string | null): ArtworkSet | undefined =>
  uuid
    ? {
        items: [
          {
            url: coverUrl(uuid, 750),
            width: 750,
            height: 750,
            purpose: 'cover',
          },
          {
            url: coverUrl(uuid, 320),
            width: 320,
            height: 320,
            purpose: 'thumbnail',
          },
        ],
      }
    : undefined;

export const mapTidalArtistSummaryToArtistRef = (
  artist: TidalArtistSummary,
): ArtistRef => ({
  name: artist.name,
  artwork: makeArtworkSet(artist.picture),
  source: makeSource(artist.id),
});

export const mapTidalArtistToArtistRef = (artist: TidalArtist): ArtistRef => ({
  name: artist.name,
  artwork: makeArtworkSet(artist.picture),
  source: makeSource(artist.id),
});

export const deduplicateAlbums = (albums: TidalAlbum[]): TidalAlbum[] => {
  const unique = new Map<string, TidalAlbum>();

  albums.forEach((album) => {
    const key = JSON.stringify([album.title, album.numberOfTracks]);
    const existing = unique.get(key);

    if (!existing) {
      unique.set(key, album);
      return;
    }

    if (album.explicit && !existing.explicit) {
      unique.set(key, album);
      return;
    }

    if (!album.explicit && existing.explicit) {
      return;
    }

    const existingTags = existing.mediaMetadata?.tags?.length ?? 0;
    const newTags = album.mediaMetadata?.tags?.length ?? 0;
    if (newTags > existingTags) {
      unique.set(key, album);
    }
  });

  return Array.from(unique.values());
};

export const mapTidalAlbumToAlbumRef = (album: TidalAlbum): AlbumRef => ({
  title: album.title,
  artists: album.artists.map(mapTidalArtistSummaryToArtistRef),
  artwork: makeArtworkSet(album.cover),
  source: makeSource(album.id),
});

export const mapTidalTrackToTrackRef = (track: TidalTrack): TrackRef => ({
  title: track.title,
  artists: track.artists.map(mapTidalArtistSummaryToArtistRef),
  artwork: makeArtworkSet(track.album.cover),
  source: makeSource(track.id),
});

export const mapTidalAlbumToAlbum = (
  album: HiFiAlbumResponse['data'],
): Album => ({
  title: album.title,
  artists: album.artists.map((artist) => ({
    name: artist.name,
    roles: [artist.type],
    source: makeSource(artist.id),
  })),
  tracks: album.items.map(({ item }) => mapTidalTrackToTrackRef(item)),
  releaseDate: album.releaseDate
    ? { precision: 'day', dateIso: album.releaseDate }
    : undefined,
  artwork: makeArtworkSet(album.cover),
  source: makeSource(album.id),
});

export const mapTidalSimilarArtistToArtistRef = (
  artist: TidalSimilarArtist,
): ArtistRef => ({
  name: artist.name,
  artwork: makeArtworkSet(artist.picture),
  source: makeSource(Number(artist.id)),
});

export const mapTidalTrackToTrack = (track: TidalTrack): Track => ({
  title: track.title,
  artists: track.artists.map((artist) => ({
    name: artist.name,
    roles: [artist.type],
    source: makeSource(artist.id),
  })),
  album: {
    title: track.album.title,
    artwork: makeArtworkSet(track.album.cover),
    source: makeSource(track.album.id),
  },
  durationMs: track.duration * 1000,
  trackNumber: track.trackNumber,
  artwork: makeArtworkSet(track.album.cover),
  source: makeSource(track.id),
});

export const mapTidalTrackToStreamCandidate = (
  track: TidalTrack,
): StreamCandidate => ({
  id: String(track.id),
  title: `${track.artists.map((artist) => artist.name).join(', ')} - ${track.title}`,
  durationMs: track.duration * 1000,
  thumbnail: track.album.cover
    ? coverUrl(track.album.cover, 320)
    : undefined,
  failed: false,
  source: makeSource(track.id),
});

const BTS_MIME_TYPE = 'application/vnd.tidal.bts';

export const resolveManifest = (
  playbackInfo: TidalPlaybackInfo,
): TidalBtsManifest => {
  if (playbackInfo.manifestMimeType !== BTS_MIME_TYPE) {
    throw new Error(
      `Unsupported manifest type: ${playbackInfo.manifestMimeType}`,
    );
  }

  return JSON.parse(atob(playbackInfo.manifest)) as TidalBtsManifest;
};

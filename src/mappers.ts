import type {
  Album,
  AlbumRef,
  ArtistBio,
  ArtistRef,
  ArtworkSet,
  ProviderRef,
  Track,
  TrackRef,
} from '@nuclearplayer/plugin-sdk';

import { METADATA_PROVIDER_ID } from './config';
import type {
  HiFiAlbumResponse,
  HiFiArtistInfoResponse,
  TidalAlbum,
  TidalArtist,
  TidalArtistSummary,
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
            url: coverUrl(uuid, 1280),
            width: 1280,
            height: 1280,
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

export const mapArtistInfoToArtistBio = (
  response: HiFiArtistInfoResponse,
): ArtistBio => ({
  name: response.artist.name,
  artwork: makeArtworkSet(response.artist.picture),
  source: makeSource(response.artist.id),
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

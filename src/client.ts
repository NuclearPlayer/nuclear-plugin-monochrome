import type { FetchFunction } from '@nuclearplayer/plugin-sdk';

import {
  BACKOFF_BASE_MS,
  BACKOFF_MAX_MS,
  REQUEST_TIMEOUT_MS,
  RETRYABLE_STATUS_CODES,
} from './config';
import { instanceRing } from './instances';
import type {
  HiFiAlbumResponse,
  HiFiArtistDiscographyResponse,
  HiFiArtistInfoResponse,
  HiFiCoverResponse,
  HiFiSearchAlbumsResponse,
  HiFiSearchArtistsResponse,
  HiFiSearchTracksResponse,
  HiFiSimilarArtistsResponse,
  HiFiTrackInfoResponse,
  HiFiTrackPlaybackResponse,
} from './types';

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const backoffDelay = (attempt: number) =>
  Math.min(BACKOFF_BASE_MS * 2 ** attempt, BACKOFF_MAX_MS);

export class HiFiClient {
  #fetch: FetchFunction;

  constructor(fetchFn: FetchFunction) {
    this.#fetch = fetchFn;
  }

  async #request<T>(
    path: string,
    params: Record<string, string> = {},
    attempt = 0,
  ): Promise<T> {
    if (attempt === 0) {
      instanceRing.reset();
    }

    if (attempt >= instanceRing.size) {
      throw new Error(`All HiFi API instances failed for ${path}`);
    }

    const url = new URL(path, instanceRing.current());
    url.search = new URLSearchParams(params).toString();

    return this.#fetch(url.toString(), {
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    })
      .then((response) => {
        if (response.ok) {
          return response.json() as Promise<T>;
        }

        if (RETRYABLE_STATUS_CODES.has(response.status)) {
          return this.#retry<T>(path, params, attempt);
        }

        throw new Error(
          `HiFi API error: ${response.status} from ${url.toString()}`,
        );
      })
      .catch(() => this.#retry<T>(path, params, attempt));
  }

  async #retry<T>(
    path: string,
    params: Record<string, string>,
    attempt: number,
  ): Promise<T> {
    instanceRing.next();
    await sleep(backoffDelay(attempt));
    return this.#request<T>(path, params, attempt + 1);
  }

  async searchTracks(
    query: string,
    limit = 25,
    offset = 0,
  ): Promise<HiFiSearchTracksResponse> {
    return this.#request('/search', {
      s: query,
      limit: String(limit),
      offset: String(offset),
    });
  }

  async searchArtists(
    query: string,
    limit = 25,
    offset = 0,
  ): Promise<HiFiSearchArtistsResponse> {
    return this.#request('/search', {
      a: query,
      limit: String(limit),
      offset: String(offset),
    });
  }

  async searchAlbums(
    query: string,
    limit = 25,
    offset = 0,
  ): Promise<HiFiSearchAlbumsResponse> {
    return this.#request('/search', {
      al: query,
      limit: String(limit),
      offset: String(offset),
    });
  }

  async getTrackInfo(trackId: number): Promise<HiFiTrackInfoResponse> {}

  async getTrackPlayback(
    trackId: number,
    quality?: string,
  ): Promise<HiFiTrackPlaybackResponse> {}

  async getAlbum(albumId: number, limit = 100): Promise<HiFiAlbumResponse> {
    return this.#request('/album', {
      id: String(albumId),
      limit: String(limit),
    });
  }

  async getArtist(artistId: number): Promise<HiFiArtistInfoResponse> {
    return this.#request('/artist', { id: String(artistId) });
  }

  async getArtistDiscography(
    artistId: number,
  ): Promise<HiFiArtistDiscographyResponse> {
    return this.#request('/artist', {
      f: String(artistId),
      skip_tracks: 'true',
    });
  }

  async getArtistTopTracks(
    artistId: number,
    limit = 15,
  ): Promise<HiFiArtistDiscographyResponse> {
    return this.#request('/artist', {
      f: String(artistId),
      limit: String(limit),
    });
  }

  async getSimilarArtists(
    artistId: number,
  ): Promise<HiFiSimilarArtistsResponse> {
    return this.#request('/artist/similar', { id: String(artistId) });
  }

  async getCover(trackId: number): Promise<HiFiCoverResponse> {
    return this.#request('/cover', { id: String(trackId) });
  }
}

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
    limit?: number,
    offset?: number,
  ): Promise<HiFiSearchTracksResponse> {}

  async searchArtists(
    query: string,
    limit?: number,
    offset?: number,
  ): Promise<HiFiSearchArtistsResponse> {}

  async searchAlbums(
    query: string,
    limit?: number,
    offset?: number,
  ): Promise<HiFiSearchAlbumsResponse> {}

  async getTrackInfo(trackId: number): Promise<HiFiTrackInfoResponse> {}

  async getTrackPlayback(
    trackId: number,
    quality?: string,
  ): Promise<HiFiTrackPlaybackResponse> {}

  async getAlbum(albumId: number, limit?: number): Promise<HiFiAlbumResponse> {}

  async getArtist(artistId: number): Promise<HiFiArtistInfoResponse> {}

  async getArtistDiscography(
    artistId: number,
  ): Promise<HiFiArtistDiscographyResponse> {}

  async getArtistTopTracks(
    artistId: number,
    limit?: number,
  ): Promise<HiFiArtistDiscographyResponse> {}

  async getSimilarArtists(
    artistId: number,
  ): Promise<HiFiSimilarArtistsResponse> {}

  async getCover(trackId: number): Promise<HiFiCoverResponse> {}
}

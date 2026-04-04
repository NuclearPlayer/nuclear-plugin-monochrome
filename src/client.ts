import type { FetchFunction } from '@nuclearplayer/plugin-sdk';

import {
  ARTIST_CACHE_TTL_MS,
  BACKOFF_BASE_MS,
  BACKOFF_MAX_MS,
  DASHBOARD_CACHE_TTL_MS,
  HOT_MONOCHROME_URL,
  REQUEST_TIMEOUT_MS,
  RETRYABLE_STATUS_CODES,
} from './config';
import { instanceRing } from './instances';
import type {
  HiFiAlbumResponse,
  HiFiArtistDiscographyResponse,
  HiFiCoverResponse,
  HiFiPlaylistResponse,
  HiFiSearchAlbumsResponse,
  HiFiSearchArtistsResponse,
  HiFiSearchTracksResponse,
  HiFiSimilarArtistsResponse,
  HiFiTrackPlaybackResponse,
  HotMonochromeResponse,
} from './types';

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const backoffDelay = (attempt: number) =>
  Math.min(BACKOFF_BASE_MS * 2 ** attempt, BACKOFF_MAX_MS);

type CacheEntry<T> = {
  data: T;
  fetchedAt: number;
};

export class HiFiClient {
  #fetch: FetchFunction;
  #artistCache = new Map<number, CacheEntry<HiFiArtistDiscographyResponse>>();
  #dashboardCache: CacheEntry<HotMonochromeResponse> | null = null;

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

  async getTrackPlayback(
    trackId: number,
    quality = 'LOSSLESS',
  ): Promise<HiFiTrackPlaybackResponse> {
    return this.#request('/track', {
      id: String(trackId),
      quality,
    });
  }

  async getAlbum(albumId: number, limit = 100): Promise<HiFiAlbumResponse> {
    return this.#request('/album', {
      id: String(albumId),
      limit: String(limit),
    });
  }

  async getArtistOverview(
    artistId: number,
  ): Promise<HiFiArtistDiscographyResponse> {
    const cached = this.#artistCache.get(artistId);
    if (cached && Date.now() - cached.fetchedAt < ARTIST_CACHE_TTL_MS) {
      return cached.data;
    }

    const data = await this.#request<HiFiArtistDiscographyResponse>('/artist', {
      f: String(artistId),
      skip_tracks: 'true',
    });
    this.#artistCache.set(artistId, { data, fetchedAt: Date.now() });
    return data;
  }

  async getSimilarArtists(
    artistId: number,
  ): Promise<HiFiSimilarArtistsResponse> {
    return this.#request('/artist/similar', { id: String(artistId) });
  }

  async getCover(trackId: number): Promise<HiFiCoverResponse> {
    return this.#request('/cover', { id: String(trackId) });
  }

  async getPlaylist(uuid: string): Promise<HiFiPlaylistResponse> {
    return this.#request('/playlist', { id: uuid });
  }

  async getDashboard(): Promise<HotMonochromeResponse> {
    if (
      this.#dashboardCache &&
      Date.now() - this.#dashboardCache.fetchedAt < DASHBOARD_CACHE_TTL_MS
    ) {
      return this.#dashboardCache.data;
    }

    const response = await this.#fetch(HOT_MONOCHROME_URL, {
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });

    if (!response.ok) {
      throw new Error(`hot.monochrome.tf returned ${response.status}`);
    }

    const data = (await response.json()) as HotMonochromeResponse;
    this.#dashboardCache = { data, fetchedAt: Date.now() };
    return data;
  }
}

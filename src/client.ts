import type { FetchFunction } from '@nuclearplayer/plugin-sdk';

import { ARTIST_CACHE_TTL_MS, MONOCHROME_API_URL } from './config';
import type {
  MonochromeArtist,
  MonochromeArtistSearchResponse,
  MonochromeRelease,
  MonochromeReleaseSearchResponse,
  MonochromeTrackSearchResponse,
} from './types';

const DEFAULT_SEARCH_LIMIT = 25;

type CacheEntry<T> = {
  data: T;
  fetchedAt: number;
};

export class MonochromeClient {
  #artistCache = new Map<string, CacheEntry<MonochromeArtist>>();

  constructor(private readonly fetch: FetchFunction) {}

  async #request<T>(path: string, params: Record<string, string> = {}) {
    const url = new URL(path, MONOCHROME_API_URL);
    url.search = new URLSearchParams(params).toString();

    const response = await this.fetch(url.toString());
    if (!response.ok) {
      throw new Error(`Monochrome API error: ${response.status} for ${path}`);
    }
    return response.json() as Promise<T>;
  }

  async #search<T>(
    category: string,
    query: string,
    limit = DEFAULT_SEARCH_LIMIT,
  ) {
    return this.#request<T>(`/search/${category}`, {
      q: query,
      limit: String(limit),
    });
  }

  searchTracks(query: string, limit?: number) {
    return this.#search<MonochromeTrackSearchResponse>('tracks', query, limit);
  }

  searchArtists(query: string, limit?: number) {
    return this.#search<MonochromeArtistSearchResponse>(
      'artists',
      query,
      limit,
    );
  }

  searchReleases(query: string, limit?: number) {
    return this.#search<MonochromeReleaseSearchResponse>(
      'releases',
      query,
      limit,
    );
  }

  getRelease(releaseId: string) {
    return this.#request<MonochromeRelease>(`/releases/${releaseId}`);
  }

  async getArtist(artistId: string) {
    const cached = this.#artistCache.get(artistId);
    if (cached && Date.now() - cached.fetchedAt < ARTIST_CACHE_TTL_MS) {
      return cached.data;
    }

    const data = await this.#request<MonochromeArtist>(`/artists/${artistId}`);
    this.#artistCache.set(artistId, { data, fetchedAt: Date.now() });
    return data;
  }

  streamUrl(trackId: string) {
    return new URL(`/track/${trackId}`, MONOCHROME_API_URL).toString();
  }
}

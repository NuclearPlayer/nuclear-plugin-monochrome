import type { FetchFunction } from '@nuclearplayer/plugin-sdk';

import { REQUEST_TIMEOUT_MS, RETRYABLE_STATUS_CODES } from './config';
import { HIFI_INSTANCES } from './instances';
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

export class HiFiClient {
  #fetch: FetchFunction;
  #instances: string[];
  #currentIndex = 0;

  constructor(fetchFn: FetchFunction) {
    this.#fetch = fetchFn;
    this.#instances = [...HIFI_INSTANCES];
  }

  get currentInstance(): string {
    return this.#instances[this.#currentIndex];
  }

  async #request<T>(
    path: string,
    params: Record<string, string> = {},
  ): Promise<T> {}

  #rotateInstance(): void {
    this.#currentIndex = (this.#currentIndex + 1) % this.#instances.length;
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

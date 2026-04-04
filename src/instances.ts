const HIFI_INSTANCES = [
  'https://api.monochrome.tf',
  'https://monochrome-api.samidy.com',
  'https://hifi.geeked.wtf',
  'https://wolf.qqdl.site',
  'https://maus.qqdl.site',
  'https://vogel.qqdl.site',
  'https://katze.qqdl.site',
  'https://hund.qqdl.site',
  'https://tidal.kinoplus.online',
];

export class InstanceRing {
  #instances: string[];
  #index = 0;

  constructor(instances: string[]) {
    this.#instances = instances;
  }

  get size(): number {
    return this.#instances.length;
  }

  current(): string {
    return this.#instances[this.#index];
  }

  next(): string {
    this.#index = (this.#index + 1) % this.#instances.length;
    return this.current();
  }

  reset(): void {
    this.#index = 0;
  }
}

export const instanceRing = new InstanceRing(HIFI_INSTANCES);

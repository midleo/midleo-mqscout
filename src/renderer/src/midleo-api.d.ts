import type { MidleoApi } from '../../shared/midleo-api';

declare global {
  interface Window {
    midleoApi: MidleoApi;
  }
}

export {};

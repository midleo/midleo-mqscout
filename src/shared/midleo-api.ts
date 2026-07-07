export interface MidleoApi {
  readQmList(): Promise<string>;
  updateQm(data: string): Promise<string>;
  execPcfqd(payload: string): Promise<string>;
}

declare global {
  interface Window {
    midleoApi: MidleoApi;
  }
}

export {};

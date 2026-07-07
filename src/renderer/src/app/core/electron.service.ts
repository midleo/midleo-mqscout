import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ElectronService {
  private get api(): Window['midleoApi'] {
    if (!window.midleoApi) {
      throw new Error('Midleo desktop API is unavailable. Run the Electron shell.');
    }
    return window.midleoApi;
  }

  readQmList(): Promise<string> {
    return this.api.readQmList();
  }

  updateQm(data: string): Promise<string> {
    return this.api.updateQm(data);
  }

  execPcfqd<T = unknown>(payload: Record<string, unknown>): Promise<T> {
    return this.api.execPcfqd(JSON.stringify(payload)).then((result: string) => {
      if (typeof result === 'string' && result.trim().startsWith('{')) {
        return JSON.parse(result) as T;
      }
      throw new Error(typeof result === 'string' ? result : 'Unexpected MQ response');
    });
  }
}

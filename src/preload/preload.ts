import { contextBridge, ipcRenderer } from 'electron';
import { IPC_CHANNELS } from '../shared/ipc-channels';
import type { MidleoApi } from '../shared/midleo-api';

const ALLOWED_CHANNELS = new Set<string>(Object.values(IPC_CHANNELS));

function assertChannel(channel: string): void {
  if (!ALLOWED_CHANNELS.has(channel)) {
    throw new Error(`Blocked IPC channel: ${channel}`);
  }
}

const midleoApi: MidleoApi = {
  readQmList: () => {
    assertChannel(IPC_CHANNELS.READ_QM_LIST);
    return ipcRenderer.invoke(IPC_CHANNELS.READ_QM_LIST);
  },
  updateQm: (data: string) => {
    assertChannel(IPC_CHANNELS.UPDATE_QM);
    return ipcRenderer.invoke(IPC_CHANNELS.UPDATE_QM, data);
  },
  execPcfqd: (payload: string) => {
    assertChannel(IPC_CHANNELS.EXEC_PCFQD);
    return ipcRenderer.invoke(IPC_CHANNELS.EXEC_PCFQD, payload);
  },
};

contextBridge.exposeInMainWorld('midleoApi', midleoApi);

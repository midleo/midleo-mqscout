export const IPC_CHANNELS = {
  READ_QM_LIST: 'mqscout:read-qm-list',
  UPDATE_QM: 'mqscout:update-qm',
  EXEC_PCFQD: 'mqscout:exec-pcfqd',
} as const;

export type IpcChannel = (typeof IPC_CHANNELS)[keyof typeof IPC_CHANNELS];

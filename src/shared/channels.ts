/** IPC channel names — use only these strings in main handlers and preload invoke. */
export const IPC_CHANNELS = {
  LIST_PROFILES: 'list-profiles',
  LIST_REGIONS: 'list-regions',
  LIST_CLUSTERS: 'list-clusters',
  LIST_SERVICES: 'list-services',
  GET_ENV_VARS: 'get-env-vars',
  SAVE_ENV_VARS: 'save-env-vars',
  GET_DEPLOYMENTS: 'get-deployments',
} as const;

export type IpcChannel = (typeof IPC_CHANNELS)[keyof typeof IPC_CHANNELS];

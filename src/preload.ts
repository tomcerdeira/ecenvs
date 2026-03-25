import { contextBridge, ipcRenderer } from 'electron';

import { IPC_CHANNELS } from '@shared/channels';
import type {
  ApiResult,
  DeploymentInfo,
  GetDeploymentsPayload,
  GetEnvVarsData,
  GetEnvVarsPayload,
  ListClustersPayload,
  ListServicesPayload,
  SaveEnvVarsPayload,
  ServiceInfo,
} from '@shared/types';

const api = {
  listProfiles: (): Promise<ApiResult<string[]>> => ipcRenderer.invoke(IPC_CHANNELS.LIST_PROFILES),

  listRegions: (): Promise<ApiResult<string[]>> => ipcRenderer.invoke(IPC_CHANNELS.LIST_REGIONS),

  listClusters: (payload: ListClustersPayload): Promise<ApiResult<string[]>> =>
    ipcRenderer.invoke(IPC_CHANNELS.LIST_CLUSTERS, payload),

  listServices: (payload: ListServicesPayload): Promise<ApiResult<ServiceInfo[]>> =>
    ipcRenderer.invoke(IPC_CHANNELS.LIST_SERVICES, payload),

  getDeployments: (payload: GetDeploymentsPayload): Promise<ApiResult<DeploymentInfo[]>> =>
    ipcRenderer.invoke(IPC_CHANNELS.GET_DEPLOYMENTS, payload),

  getEnvVars: (payload: GetEnvVarsPayload): Promise<ApiResult<GetEnvVarsData>> =>
    ipcRenderer.invoke(IPC_CHANNELS.GET_ENV_VARS, payload),

  saveEnvVars: (payload: SaveEnvVarsPayload): Promise<ApiResult<{ saved: false }>> =>
    ipcRenderer.invoke(IPC_CHANNELS.SAVE_ENV_VARS, payload),
};

contextBridge.exposeInMainWorld('api', api);

export type EcEnvsApi = typeof api;

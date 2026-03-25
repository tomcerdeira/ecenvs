import type {
  ApiResult,
  GetEnvVarsPayload,
  ListClustersPayload,
  ListServicesPayload,
  ServiceInfo,
} from '@shared/types';

function unwrap<T>(result: ApiResult<T>): T {
  if (result.ok) {
    return result.data;
  }
  const { code, message } = result.error;
  throw new Error(message || code || 'Request failed');
}

export async function listProfiles(): Promise<string[]> {
  return unwrap(await window.api.listProfiles());
}

export async function listRegions(): Promise<string[]> {
  return unwrap(await window.api.listRegions());
}

export async function listClusters(payload: ListClustersPayload): Promise<string[]> {
  return unwrap(await window.api.listClusters(payload));
}

export async function listServices(payload: ListServicesPayload): Promise<ServiceInfo[]> {
  return unwrap(await window.api.listServices(payload));
}

/** Lists container names from the service's task definition (omit `containerName` on getEnvVars). */
export async function getContainerNamesForService(
  payload: Omit<GetEnvVarsPayload, 'containerName'>
): Promise<string[]> {
  const data = unwrap(await window.api.getEnvVars(payload));
  if (!('containerNames' in data)) {
    throw new Error('Expected container list from API');
  }
  return data.containerNames;
}

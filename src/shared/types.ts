/** Standard API envelope for renderer ↔ main IPC. */
export type ApiResult<T> = { ok: true; data: T } | { ok: false; error: ApiError };

export interface ApiError {
  code: string;
  message: string;
  details?: unknown;
}

export interface EnvVar {
  name: string;
  value: string;
  /** Plain env vs secret ref — secrets may be read-only in UI later */
  source?: 'plain' | 'secret';
}

export interface ContainerEnv {
  containerName: string;
  environment: EnvVar[];
}

export interface ServiceInfo {
  serviceName: string;
  serviceArn: string;
  taskDefinitionArn: string;
  status?: string;
}

/** ECS deployment summary (from DescribeServices). */
export interface DeploymentInfo {
  id: string;
  status: string;
  taskDefinition: string;
  desiredCount: number;
  pendingCount: number;
  runningCount: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProfileRegionPayload {
  profile: string;
  region: string;
}

export type ListClustersPayload = ProfileRegionPayload;

export interface ListServicesPayload extends ProfileRegionPayload {
  clusterArn: string;
}

export interface GetDeploymentsPayload extends ProfileRegionPayload {
  clusterArn: string;
  serviceName: string;
}

export interface GetEnvVarsPayload extends ProfileRegionPayload {
  clusterArn: string;
  serviceName: string;
  /** When omitted, response lists container names only (task definition describe). */
  containerName?: string;
}

/** When `containerName` is omitted — UI loads container names for Commit 5 cascade. */
export type GetEnvVarsListContainersData = {
  containerNames: string[];
};

/** When `containerName` is set — env for one container. */
export type GetEnvVarsForContainerData = {
  containerName: string;
  environment: EnvVar[];
};

export type GetEnvVarsData = GetEnvVarsListContainersData | GetEnvVarsForContainerData;

export interface SaveEnvVarsPayload extends ProfileRegionPayload {
  clusterArn: string;
  serviceName: string;
  containerName: string;
  environment: EnvVar[];
}

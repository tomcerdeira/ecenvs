import { ipcMain } from 'electron';

import { AWS_REGION_IDS } from '@shared/aws-regions';
import { IPC_CHANNELS } from '@shared/channels';
import type {
  ApiError,
  ApiResult,
  DeploymentInfo,
  GetDeploymentsPayload,
  GetEnvVarsData,
  GetEnvVarsPayload,
  ListClustersPayload,
  ListServicesPayload,
  ServiceInfo,
} from '@shared/types';
import { listAwsProfiles } from '../services/aws-profiles';
import {
  createEcsClient,
  getContainerEnvironment,
  getDeploymentsForService,
  getServiceTaskDefinitionArn,
  getTaskDefinitionContainerNames,
  listAllClusterArns,
  listServiceInfos,
} from '../services/ecs-client';

function isNonEmptyString(v: unknown): v is string {
  return typeof v === 'string' && v.trim().length > 0;
}

function errToApiError(err: unknown): ApiError {
  if (err && typeof err === 'object' && 'name' in err) {
    const name = String((err as { name?: string }).name);
    const message = err instanceof Error ? err.message : String(err);
    if (name === 'CredentialsProviderError') {
      return { code: 'AWS_CREDENTIALS', message };
    }
    if (
      name === 'AccessDeniedException' ||
      name === 'UnauthorizedOperation' ||
      name === 'ForbiddenException'
    ) {
      return { code: 'AWS_ACCESS_DENIED', message };
    }
    if (name === 'InvalidClientTokenId' || name === 'UnrecognizedClientException') {
      return { code: 'AWS_CREDENTIALS', message };
    }
    return { code: 'AWS_ERROR', message, details: name };
  }
  if (err instanceof Error) {
    return { code: 'ERROR', message: err.message };
  }
  return { code: 'UNKNOWN', message: String(err) };
}

function ok<T>(data: T): ApiResult<T> {
  return { ok: true, data };
}

function fail(err: unknown): ApiResult<never> {
  return { ok: false, error: errToApiError(err) };
}

function failMsg(code: string, message: string): ApiResult<never> {
  return { ok: false, error: { code, message } };
}

export function registerIpcHandlers(): void {
  ipcMain.handle(IPC_CHANNELS.LIST_PROFILES, async (): Promise<ApiResult<string[]>> => {
    try {
      const result = listAwsProfiles();
      if (!result.ok) {
        return failMsg('AWS_CONFIG', result.message);
      }
      return ok(result.profiles);
    } catch (e) {
      return fail(e);
    }
  });

  ipcMain.handle(IPC_CHANNELS.LIST_REGIONS, async (): Promise<ApiResult<string[]>> => {
    return ok([...AWS_REGION_IDS]);
  });

  ipcMain.handle(
    IPC_CHANNELS.LIST_CLUSTERS,
    async (_evt, payload: unknown): Promise<ApiResult<string[]>> => {
      try {
        const p = payload as ListClustersPayload;
        if (!isNonEmptyString(p?.profile) || !isNonEmptyString(p?.region)) {
          return failMsg('INVALID_PAYLOAD', 'profile and region are required');
        }
        const client = createEcsClient(p.profile, p.region);
        const arns = await listAllClusterArns(client);
        return ok(arns);
      } catch (e) {
        return fail(e);
      }
    }
  );

  ipcMain.handle(
    IPC_CHANNELS.LIST_SERVICES,
    async (_evt, payload: unknown): Promise<ApiResult<ServiceInfo[]>> => {
      try {
        const p = payload as ListServicesPayload;
        if (!isNonEmptyString(p?.profile) || !isNonEmptyString(p?.region)) {
          return failMsg('INVALID_PAYLOAD', 'profile and region are required');
        }
        if (!isNonEmptyString(p?.clusterArn)) {
          return failMsg('INVALID_PAYLOAD', 'clusterArn is required');
        }
        const client = createEcsClient(p.profile, p.region);
        const infos = await listServiceInfos(client, p.clusterArn);
        return ok(infos);
      } catch (e) {
        return fail(e);
      }
    }
  );

  ipcMain.handle(
    IPC_CHANNELS.GET_DEPLOYMENTS,
    async (_evt, payload: unknown): Promise<ApiResult<DeploymentInfo[]>> => {
      try {
        const p = payload as GetDeploymentsPayload;
        if (!isNonEmptyString(p?.profile) || !isNonEmptyString(p?.region)) {
          return failMsg('INVALID_PAYLOAD', 'profile and region are required');
        }
        if (!isNonEmptyString(p?.clusterArn) || !isNonEmptyString(p?.serviceName)) {
          return failMsg('INVALID_PAYLOAD', 'clusterArn and serviceName are required');
        }
        const client = createEcsClient(p.profile, p.region);
        const deployments = await getDeploymentsForService(client, p.clusterArn, p.serviceName);
        return ok(deployments);
      } catch (e) {
        return fail(e);
      }
    }
  );

  ipcMain.handle(
    IPC_CHANNELS.GET_ENV_VARS,
    async (_evt, payload: unknown): Promise<ApiResult<GetEnvVarsData>> => {
      try {
        const p = payload as GetEnvVarsPayload;
        if (!isNonEmptyString(p?.profile) || !isNonEmptyString(p?.region)) {
          return failMsg('INVALID_PAYLOAD', 'profile and region are required');
        }
        if (!isNonEmptyString(p?.clusterArn) || !isNonEmptyString(p?.serviceName)) {
          return failMsg('INVALID_PAYLOAD', 'clusterArn and serviceName are required');
        }
        const client = createEcsClient(p.profile, p.region);
        const taskDefArn = await getServiceTaskDefinitionArn(client, p.clusterArn, p.serviceName);
        if (!p.containerName?.trim()) {
          const containerNames = await getTaskDefinitionContainerNames(client, taskDefArn);
          return ok({ containerNames });
        }
        const environment = await getContainerEnvironment(
          client,
          taskDefArn,
          p.containerName.trim()
        );
        return ok({
          containerName: p.containerName.trim(),
          environment,
        });
      } catch (e) {
        return fail(e);
      }
    }
  );

  ipcMain.handle(IPC_CHANNELS.SAVE_ENV_VARS, async (): Promise<ApiResult<{ saved: false }>> => {
    return {
      ok: false,
      error: {
        code: 'NOT_IMPLEMENTED',
        message:
          'Saving environment variables is not implemented yet (planned for a later commit).',
      },
    };
  });
}

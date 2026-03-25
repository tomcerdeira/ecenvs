import {
  DescribeServicesCommand,
  DescribeTaskDefinitionCommand,
  ECSClient,
  ListClustersCommand,
  ListServicesCommand,
  type Deployment,
  type Service,
} from '@aws-sdk/client-ecs';
import { fromIni } from '@aws-sdk/credential-providers';

import type { DeploymentInfo, EnvVar, ServiceInfo } from '@shared/types';

export function createEcsClient(profile: string, region: string): ECSClient {
  return new ECSClient({
    region,
    credentials: fromIni({ profile }),
  });
}

export async function listAllClusterArns(client: ECSClient): Promise<string[]> {
  const arns: string[] = [];
  let nextToken: string | undefined;
  do {
    const out = await client.send(new ListClustersCommand({ nextToken }));
    arns.push(...(out.clusterArns ?? []));
    nextToken = out.nextToken;
  } while (nextToken);
  return arns;
}

export async function listAllServiceArns(client: ECSClient, clusterArn: string): Promise<string[]> {
  const arns: string[] = [];
  let nextToken: string | undefined;
  do {
    const out = await client.send(new ListServicesCommand({ cluster: clusterArn, nextToken }));
    arns.push(...(out.serviceArns ?? []));
    nextToken = out.nextToken;
  } while (nextToken);
  return arns;
}

/** Short name from full ARN .../service-name */
function serviceNameFromArn(arn: string): string {
  const parts = arn.split('/');
  return parts[parts.length - 1] ?? arn;
}

export async function describeServicesInfo(
  client: ECSClient,
  clusterArn: string,
  serviceArns: string[]
): Promise<ServiceInfo[]> {
  if (serviceArns.length === 0) {
    return [];
  }
  const out = await client.send(
    new DescribeServicesCommand({
      cluster: clusterArn,
      services: serviceArns,
    })
  );
  if (out.failures && out.failures.length > 0) {
    const msg = out.failures.map((f) => f.reason ?? 'unknown').join('; ');
    throw new Error(`DescribeServices failed: ${msg}`);
  }
  const services = out.services ?? [];
  return services.map((s: Service) => ({
    serviceName: s.serviceName ?? serviceNameFromArn(s.serviceArn ?? ''),
    serviceArn: s.serviceArn ?? '',
    taskDefinitionArn: s.taskDefinition ?? '',
    status: s.status,
  }));
}

const DESCRIBE_SERVICES_BATCH = 10;

/** List all services in a cluster with task definition ARNs (paginated list + batched describe). */
export async function listServiceInfos(
  client: ECSClient,
  clusterArn: string
): Promise<ServiceInfo[]> {
  const arns = await listAllServiceArns(client, clusterArn);
  const infos: ServiceInfo[] = [];
  for (let i = 0; i < arns.length; i += DESCRIBE_SERVICES_BATCH) {
    const batch = arns.slice(i, i + DESCRIBE_SERVICES_BATCH);
    const part = await describeServicesInfo(client, clusterArn, batch);
    infos.push(...part);
  }
  return infos.sort((a, b) => a.serviceName.localeCompare(b.serviceName));
}

export async function getServiceTaskDefinitionArn(
  client: ECSClient,
  clusterArn: string,
  serviceName: string
): Promise<string> {
  const out = await client.send(
    new DescribeServicesCommand({
      cluster: clusterArn,
      services: [serviceName],
    })
  );
  if (out.failures && out.failures.length > 0) {
    const msg = out.failures.map((f) => f.reason ?? 'unknown').join('; ');
    throw new Error(`DescribeServices failed: ${msg}`);
  }
  const arn = out.services?.[0]?.taskDefinition;
  if (!arn) {
    throw new Error(`Service not found or has no task definition: ${serviceName}`);
  }
  return arn;
}

function mapDeployment(d: Deployment): DeploymentInfo {
  return {
    id: d.id ?? '',
    status: d.status ?? '',
    taskDefinition: d.taskDefinition ?? '',
    desiredCount: d.desiredCount ?? 0,
    pendingCount: d.pendingCount ?? 0,
    runningCount: d.runningCount ?? 0,
    createdAt: d.createdAt?.toISOString(),
    updatedAt: d.updatedAt?.toISOString(),
  };
}

export async function getDeploymentsForService(
  client: ECSClient,
  clusterArn: string,
  serviceName: string
): Promise<DeploymentInfo[]> {
  const out = await client.send(
    new DescribeServicesCommand({
      cluster: clusterArn,
      services: [serviceName],
    })
  );
  if (out.failures && out.failures.length > 0) {
    const msg = out.failures.map((f) => f.reason ?? 'unknown').join('; ');
    throw new Error(`DescribeServices failed: ${msg}`);
  }
  const svc = out.services?.[0];
  const deployments = svc?.deployments ?? [];
  return deployments.map(mapDeployment);
}

export async function getTaskDefinitionContainerNames(
  client: ECSClient,
  taskDefinitionArn: string
): Promise<string[]> {
  const out = await client.send(
    new DescribeTaskDefinitionCommand({ taskDefinition: taskDefinitionArn })
  );
  const defs = out.taskDefinition?.containerDefinitions ?? [];
  return defs.map((c) => c.name ?? '').filter(Boolean);
}

export async function getContainerEnvironment(
  client: ECSClient,
  taskDefinitionArn: string,
  containerName: string
): Promise<EnvVar[]> {
  const out = await client.send(
    new DescribeTaskDefinitionCommand({ taskDefinition: taskDefinitionArn })
  );
  const defs = out.taskDefinition?.containerDefinitions ?? [];
  const container = defs.find((c) => c.name === containerName);
  if (!container) {
    throw new Error(`Container not found in task definition: ${containerName}`);
  }
  const env: EnvVar[] = [];
  for (const e of container.environment ?? []) {
    if (e.name) {
      env.push({ name: e.name, value: e.value ?? '', source: 'plain' });
    }
  }
  for (const s of container.secrets ?? []) {
    if (s.name) {
      env.push({
        name: s.name,
        value: s.valueFrom ?? '',
        source: 'secret',
      });
    }
  }
  return env;
}

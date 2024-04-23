import { ModuleMetadata, Type } from '@nestjs/common';

export interface ClusterHubModuleOptions {
  workers: number;
}

export interface ClusterHubModuleOptionsFactory {
  createClusterHubOptions(): Promise<ClusterHubModuleOptions> | ClusterHubModuleOptions;
}

export interface ClusterHubModuleAsyncOptions extends Pick<ModuleMetadata, 'imports'> {
  useExisting?: Type<ClusterHubModuleOptionsFactory>;
  useClass?: Type<ClusterHubModuleOptionsFactory>;
  useFactory?: (...args: any[]) => Promise<ClusterHubModuleOptions> | ClusterHubModuleOptions;
  inject?: any[];
}

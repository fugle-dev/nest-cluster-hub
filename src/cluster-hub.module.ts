import { Module, DynamicModule, Global } from '@nestjs/common';
import { DiscoveryModule } from '@nestjs/core';
import { CLUSTER_HUB } from './cluster-hub.constants';
import { ClusterHub } from './cluster-hub';
import { ClusterHubExplorer } from './cluster-hub.explorer';
import { ClusterHubMetadataAccessor } from './cluster-hub-metadata.accessor';

@Global()
@Module({})
export class ClusterHubModule {
  static forRoot(): DynamicModule {
    return {
      module: ClusterHubModule,
      imports: [DiscoveryModule],
      providers: [
        ClusterHubExplorer,
        ClusterHubMetadataAccessor,
        {
          provide: CLUSTER_HUB,
          useValue: new ClusterHub(),
        },
      ],
      exports: [CLUSTER_HUB],
    };
  }
}

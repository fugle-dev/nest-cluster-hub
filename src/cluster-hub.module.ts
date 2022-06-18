import { Module, DynamicModule, Global } from '@nestjs/common';
import { CLUSTER_HUB } from './cluster-hub.constants';
import { ClusterHub } from './cluster-hub';

@Global()
@Module({})
export class ClusterHubModule {
  static forRoot(): DynamicModule {
    return {
      module: ClusterHubModule,
      providers: [
        {
          provide: CLUSTER_HUB,
          useValue: new ClusterHub(),
        },
      ],
      exports: [CLUSTER_HUB],
    };
  }
}

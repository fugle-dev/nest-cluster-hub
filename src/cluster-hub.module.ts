import { Module, DynamicModule, Provider, Global, Type } from '@nestjs/common';
import { DiscoveryModule } from '@nestjs/core';
import { CLUSTER_HUB_INSTANCE, CLUSTER_HUB_OPTIONS } from './cluster-hub.constants';
import { ClusterHub } from './cluster-hub';
import { ClusterHubExplorer } from './cluster-hub.explorer';
import { ClusterHubMetadataAccessor } from './cluster-hub-metadata.accessor';
import { ClusterHubModuleAsyncOptions, ClusterHubModuleOptions, ClusterHubModuleOptionsFactory } from './interfaces';

@Global()
@Module({
  imports: [DiscoveryModule],
  providers: [ClusterHubExplorer, ClusterHubMetadataAccessor],
})
export class ClusterHubModule {
  static forRoot(options?: ClusterHubModuleOptions): DynamicModule {
    return {
      module: ClusterHubModule,
      imports: [DiscoveryModule],
      providers: [
        {
          provide: CLUSTER_HUB_INSTANCE,
          useValue: ClusterHub.getInstance(options),
        },
      ],
      exports: [CLUSTER_HUB_INSTANCE],
    };
  }

  static forRootAsync(options?: ClusterHubModuleAsyncOptions): DynamicModule {
    return {
      module: ClusterHubModule,
      imports: options.imports,
      providers: [
        ...this.createAsyncProviders(options),
        {
          provide: CLUSTER_HUB_INSTANCE,
          useFactory: (options: ClusterHubModuleOptions) => ClusterHub.getInstance(options),
          inject: [CLUSTER_HUB_INSTANCE],
        },
      ],
      exports: [CLUSTER_HUB_INSTANCE],
    };
  }

  private static createAsyncProviders(options: ClusterHubModuleAsyncOptions): Provider[] {
    if (options.useExisting || options.useFactory) {
      return [this.createAsyncOptionsProvider(options)];
    }
    const useClass = options.useClass as Type<ClusterHubModuleOptionsFactory>;
    return [
      this.createAsyncOptionsProvider(options),
      {
        provide: useClass,
        useClass,
      },
    ];
  }

  private static createAsyncOptionsProvider(options: ClusterHubModuleAsyncOptions): Provider {
    if (options.useFactory) {
      return {
        provide: CLUSTER_HUB_OPTIONS,
        useFactory: options.useFactory,
        inject: options.inject || [],
      };
    }
    const inject = [
      (options.useClass ||
        options.useExisting) as Type<ClusterHubModuleOptionsFactory>,
    ];
    return {
      provide: CLUSTER_HUB_OPTIONS,
      useFactory: async (optionsFactory: ClusterHubModuleOptionsFactory) =>
        await optionsFactory.createClusterHubOptions(),
      inject,
    };
  }
}

import { Inject, Injectable, OnApplicationBootstrap, OnApplicationShutdown } from '@nestjs/common';
import { DiscoveryService, MetadataScanner } from '@nestjs/core';
import { InstanceWrapper } from '@nestjs/core/injector/instance-wrapper';
import { ClusterHub } from './cluster-hub';
import { ClusterHubMetadataAccessor } from './cluster-hub-metadata.accessor';
import { CLUSTER_HUB_INSTANCE } from './cluster-hub.constants';

@Injectable()
export class ClusterHubExplorer implements OnApplicationBootstrap, OnApplicationShutdown {
  constructor(
    @Inject(CLUSTER_HUB_INSTANCE) private readonly hub: ClusterHub,
    private readonly discoveryService: DiscoveryService,
    private readonly metadataAccessor: ClusterHubMetadataAccessor,
    private readonly metadataScanner: MetadataScanner,
  ) { }

  onApplicationBootstrap() {
    this.loadClusterHubListeners();
  }

  onApplicationShutdown() {
    this.hub.removeAllListeners();
  }

  loadClusterHubListeners() {
    const providers = this.discoveryService.getProviders();
    const controllers = this.discoveryService.getControllers();
    [...providers, ...controllers]
      .filter(wrapper => wrapper.isDependencyTreeStatic())
      .filter(wrapper => wrapper.instance)
      .forEach((wrapper: InstanceWrapper) => {
        const { instance } = wrapper;
        const prototype = Object.getPrototypeOf(instance) || {};
        this.metadataScanner.scanFromPrototype(
          instance,
          prototype,
          (methodKey: string) =>
            this.subscribeToClusterHubIfListener(instance, methodKey),
        );
      });
  }

  private subscribeToClusterHubIfListener(instance: Record<string, any>, methodKey: string) {
    const clusterHubListenerMetadata = this.metadataAccessor.getClusterHubListenerMetadata(instance[methodKey]);
    if (!clusterHubListenerMetadata) return;

    const { type, options } = clusterHubListenerMetadata;
    const listenerMethod = !!options?.prependListener
      ? this.hub.prependListener.bind(this.hub)
      : this.hub.on.bind(this.hub);

    listenerMethod(type, (...args: unknown[]) => instance[methodKey].call(instance, ...args));
  }
}

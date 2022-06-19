import { Injectable, Type } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { CLUSTER_HUB_LISTENER_METADATA } from './cluster-hub.constants';
import { ListenerMetadata } from './interfaces';

@Injectable()
export class ClusterHubMetadataAccessor {
  constructor(private readonly reflector: Reflector) {}

  getClusterHubListenerMetadata(target: Type<unknown>): ListenerMetadata | undefined {
    return this.reflector.get(CLUSTER_HUB_LISTENER_METADATA, target);
  }
}

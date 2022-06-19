import { SetMetadata } from '@nestjs/common';
import { ListenerOptions, ListenerMetadata } from '../interfaces';
import { CLUSTER_HUB_LISTENER_METADATA } from '../cluster-hub.constants';

export const OnMessage = (type: string | symbol, options?: ListenerOptions): MethodDecorator => {
  return SetMetadata(CLUSTER_HUB_LISTENER_METADATA, { type, options } as ListenerMetadata);
};

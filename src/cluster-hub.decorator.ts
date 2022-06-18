import { Inject } from '@nestjs/common';
import { CLUSTER_HUB } from './cluster-hub.constants';

export const InjectClusterHub = (): ParameterDecorator => {
  return Inject(CLUSTER_HUB);
};

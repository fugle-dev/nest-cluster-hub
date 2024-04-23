import { Inject } from '@nestjs/common';
import { CLUSTER_HUB_INSTANCE } from '../cluster-hub.constants';

export const InjectClusterHub = (): ParameterDecorator => {
  return Inject(CLUSTER_HUB_INSTANCE);
};

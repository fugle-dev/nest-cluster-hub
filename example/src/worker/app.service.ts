import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { InjectClusterHub, ClusterHub } from 'nest-cluster-hub';

@Injectable()
export class AppService implements OnApplicationBootstrap {
  constructor(@InjectClusterHub() private readonly hub: ClusterHub) {}

  async onApplicationBootstrap() {
    this.hub.on('sum', (data: number[], sender, callback) => {
      callback(null, (data || []).reduce((a, b) => a + b));
    });
  }
}

import { Controller, Get, Res } from '@nestjs/common';
import { InjectClusterHub, ClusterHub } from 'nest-cluster-hub';
import { Response } from 'express';

@Controller()
export class AppController {
  constructor(@InjectClusterHub() private readonly hub: ClusterHub) {}

  @Get()
  execute(@Res() res: Response) {
    const data = [1, 2, 3, 4, 5];
    this.hub.requestRandomWorker('sum', data, (err, sum) => {
      res.json({ sum });
    });
  }
}

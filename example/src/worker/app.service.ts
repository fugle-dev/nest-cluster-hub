import { Injectable } from '@nestjs/common';
import { OnRequest } from 'nest-cluster-hub';

@Injectable()
export class AppService {
  @OnRequest('sum')
  handleRequest(data: number[], sender, callback) {
    callback(null, (data || []).reduce((a, b) => a + b));
  }
}

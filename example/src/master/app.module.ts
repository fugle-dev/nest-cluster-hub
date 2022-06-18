import { Module } from '@nestjs/common';
import { ClusterHubModule } from 'nest-cluster-hub';
import { AppController } from './app.controller';

@Module({
  imports: [ClusterHubModule.forRoot()],
  controllers: [AppController],
})
export class AppModule {}

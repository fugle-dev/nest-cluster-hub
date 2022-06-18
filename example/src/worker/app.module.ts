import { Module } from '@nestjs/common';
import { ClusterHubModule } from 'nest-cluster-hub';
import { AppService } from './app.service'

@Module({
  imports: [ClusterHubModule.forRoot()],
  providers: [AppService],
})
export class AppModule {}

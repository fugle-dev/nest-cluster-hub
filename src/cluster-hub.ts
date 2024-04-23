import * as cluster from 'cluster';
import * as os from 'os';
import * as Hub from 'cluster-hub';
import * as HashRing from 'hashring';
import { ClusterHubModuleOptions } from './interfaces/cluster-hub-module-options.interface';
import { LOCALS_GET_EVENT, LOCALS_SET_EVENT } from './cluster-hub.constants';

export class ClusterHub extends Hub {
  private static instance: ClusterHub;
  private ring: HashRing;
  private locals: Map<string, any>;
  private numWorkers: number;
  private numWorkersReady: number;
  private workersReadyCallback?: () => void;

  constructor(private options?: ClusterHubModuleOptions) {
    super();

    if (cluster.isMaster) {
      this.setupWorkers();
      this.setupLocals();
    }
  }

  public static getInstance(options?: ClusterHubModuleOptions): ClusterHub {
    if (!ClusterHub.instance) {
      ClusterHub.instance = new ClusterHub(options);
    }
    return ClusterHub.instance;
  }

  sendToWorker(worker: cluster.Worker | string, type: string, data?: any): boolean {
    return (worker instanceof cluster.Worker)
      ? super.sendToWorker(worker, type, data)
      : super.sendToWorker(this.getWorker(worker), type, data);
  }

  requestWorker(worker: cluster.Worker | string, type: string, data?: any, callback?: Hub.Callback): boolean {
    return (worker instanceof cluster.Worker)
      ? super.requestWorker(worker, type, data, callback)
      : super.requestWorker(this.getWorker(worker), type, data, callback);
  }

  get(key: string, callback?: Hub.Callback) {
    return this.requestMaster(LOCALS_GET_EVENT, key, callback);
  }

  set(key: string, value: any, callback?: Hub.Callback) {
    return this.requestMaster(LOCALS_SET_EVENT, { key, value }, callback);
  }

  getWorker(key: string): cluster.Worker {
    if (cluster.isWorker) {
      throw new Error('The current process is not a primary');
    }
    return cluster.workers[this.ring.get(key)];
  }

  getWorkers(): NodeJS.Dict<cluster.Worker> {
    if (cluster.isWorker) {
      throw new Error('The current process is not a primary');
    }
    return cluster.workers;
  }

  waitWorkers(callback: () => void): void {
    if (cluster.isWorker) {
      throw new Error('The current process is not a primary');
    }
    if (this.numWorkersReady === this.numWorkers) {
      callback();
    } else {
      this.workersReadyCallback = callback;
    }
  }

  private setupWorkers() {
    this.ring = new HashRing([]);
    this.numWorkers = this.options?.workers ?? os.cpus().length;
    this.numWorkersReady = 0;

    cluster.on('online', (worker) => {
      this.ring.add(`${worker.id}`);
      this.numWorkersReady++;

      if (this.workersReadyCallback && this.numWorkersReady === this.numWorkers) {
        this.workersReadyCallback();
      }
    });

    cluster.on('exit', (worker) => {
      this.ring.remove(`${worker.id}`);
    });
  }

  private setupLocals() {
    this.locals = new Map();

    this.on(LOCALS_GET_EVENT, (key, sender, callback) => {
      callback(null, this.locals.get(key));
    });

    this.on(LOCALS_SET_EVENT, ({ key, value }, sender, callback) => {
      this.locals.set(key, value);
      callback(null);
    });
  }
}

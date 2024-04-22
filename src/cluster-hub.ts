import * as cluster from 'cluster';
import * as Hub from 'cluster-hub';
import * as HashRing from 'hashring';
import { LOCALS_GET_EVENT, LOCALS_SET_EVENT } from './cluster-hub.constants';

export class ClusterHub extends Hub {
  private static instance: ClusterHub;
  private ring: HashRing;
  private locals: Map<string, any>;

  constructor() {
    super();

    if (cluster.isMaster) {
      this.setupWorkers();
      this.setupLocals();
    }
  }

  public static getInstance(): ClusterHub {
    if (!ClusterHub.instance) {
      ClusterHub.instance = new ClusterHub();
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

  private setupWorkers() {
    this.ring = new HashRing([]);

    cluster.on('online', (worker) => {
      this.ring.add(`${worker.id}`);
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

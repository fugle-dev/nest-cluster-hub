# nest-cluster-hub

[![NPM version][npm-image]][npm-url]

> A Nest module for communication between master and worker processes based on [node-cluster-hub](https://github.com/sirian/node-cluster-hub)

## Installation

To begin using it, we first install the required dependency.

```bash
$ npm install --save nest-cluster-hub
```

## Getting started

Once the installation is complete, import the `ClusterHubModule` into the root `AppModule` and run the `forRoot()` static method as shown below:

```typescript
import { Module } from '@nestjs/common';
import { ClusterHubModule } from 'nest-cluster-hub';

@Module({
  imports: [
    ClusterHubModule.forRoot(),
  ],
})
export class AppModule {}
```

Next, inject the `ClusterHub` instance using the `@InjectClusterHub()` decorator.

```typescript
constructor(@InjectClusterHub() private readonly hub: ClusterHub) {}
```

## Sending messages

### Sending a message to a specific worker

```typescript
if (cluster.isPrimary) {
  this.hub.sendToWorker(worker, 'master-to-worker', 1);
}
```

Note that you can just pass a string instead of `cluster.Worker`. The library uses [HashRing](https://github.com/3rd-Eden/node-hashring) to let you find the correct worker for the key which is closest to the point after what the given key hashes to.

### Sending a message to a random worker

```typescript
if (cluster.isPrimary) {
  this.hub.sendToRandomWorker('master-to-worker', 1);
}
```

### Sending (broadcasting) a message to all workers

```typescript
if (cluster.isPrimary) {
  this.hub.sendToWorkers('master-to-worker', 1);
}
```

### Sending a message to the master (primary)

```typescript
if (cluster.isPrimary) {
  this.hub.sendToMaster('master-to-master', 1);
}

if (cluster.isWorker) {
  this.hub.sendToMaster('worker-to-worker', 1);
}
```

### Handling received messages

```typescript
if (cluster.isPrimary) {
  this.hub.on('master-to-master', (data) => {
    console.log('master-to-master received');
  });

  this.hub.on('worker-to-master', (data) => {
    console.log('worker-to-master received');
  });
}

if (cluster.isWorker) {
  this.hub.on('master-to-worker', () => {
    console.log('master-to-worker received');
  });
}
```

## Request-response

### Sending a request to a specific worker

```typescript
if (cluster.isPrimary) {
  this.hub.requestWorker(worker, 'mult', { a: 5, b: 7 }, (err, sum) => {
    console.log('Mult in master: ' + sum);
  });
}
```

You can also pass a string instead of `cluster.Worker` to find the correct worker.

### Sending a request to a random worker

```typescript
if (cluster.isPrimary) {
  this.hub.requestRandomWorker('mult', { a: 5, b: 7 }, (err, sum) => {
    console.log('Mult in master: ' + sum);
  });
}
```

### Sending a request to the master (primary)

```typescript
if (cluster.isPrimary) {
  this.hub.requestMaster('sum', { a: 5, b: 7 }, (err, sum) => {
    console.log('Sum in master: ' + sum);
  });
}

if (cluster.isWorker) {
  this.hub.requestMaster('sum', { a: 5, b: 7 }, (err, sum) => {
    console.log('Sum in worker: ' + sum);
  });
}
```

### Handling requests and responses

```typescript
if (cluster.isPrimary) {
  this.hub.on('sum', (data, sender, callback) => {
    callback(null, data.a + data.b);
  });
}

if (cluster.isWorker) {
  this.hub.on('mult', (data, sender, callback) => {
    callback(null, data.a * data.b);
  });
}
```

## Sharing data between processes

```typescript
this.hub.set('foo', 'bar', () => {
  this.hub.get('foo', (err, value) => {
    console.log(value === 'bar'); // true
  });
});
```

## Example

A working example is available [here](https://github.com/chunkai1312/nest-cluster-hub/tree/master/example).

## License

[MIT](LICENSE)

[npm-image]: https://img.shields.io/npm/v/nest-cluster-hub.svg
[npm-url]: https://npmjs.com/package/nest-cluster-hub

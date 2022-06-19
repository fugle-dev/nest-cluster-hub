import { ListenerOptions } from './listener-options.interface';

export interface ListenerMetadata {
  type: string | symbol;
  options?: ListenerOptions;
}

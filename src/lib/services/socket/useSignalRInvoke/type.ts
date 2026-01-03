import type * as signalR from '@microsoft/signalr';

import type {
  ClientToServerEvents,
  EventsOf,
} from '../types';

export type EventName = EventsOf<ClientToServerEvents>;

export type InvokeArguments<Event extends EventName> =
  Event extends keyof ClientToServerEvents
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    ? ClientToServerEvents[Event] extends (...args: infer Args) => any
      ? Args
      : readonly unknown[]
    : readonly unknown[];

export type UseSignalRInvoke = () => {
  readonly invoke: <Event extends EventName>(
    methodName: Event,
    ...args: InvokeArguments<Event>
  ) => Promise<void>;
  readonly connection: signalR.HubConnection | null;
};
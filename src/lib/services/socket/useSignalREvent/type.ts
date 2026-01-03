'use client';
import type * as signalR from '@microsoft/signalr';

import type {
  ServerToClientEvents,
  EventsOf,
  MapToUndefined,
} from '../types';

export type EventName = EventsOf<ServerToClientEvents>;

export type HandlerValues<Event extends EventName> =
  Event extends keyof ServerToClientEvents
    ? ServerToClientEvents[Event] extends (...args: infer Args) => void
      ? Args
      : readonly unknown[]
    : readonly unknown[];

export type UseSignalREventResult<Event extends EventName> = {
  readonly connection: signalR.HubConnection | null;
  readonly data: MapToUndefined<HandlerValues<Event>>;
};

export type UseSignalREvent = <Event extends EventName>(
  methodName: Event,
  config?: Config<Event>,
) => UseSignalREventResult<Event>;

export type Config<Event extends EventName> = {
  readonly handler?: (...values: HandlerValues<Event>) => void;
};

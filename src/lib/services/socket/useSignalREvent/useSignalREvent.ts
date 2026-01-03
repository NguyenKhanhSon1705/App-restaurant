'use client';
import { useEffect, useState } from 'react';
import type { MapToUndefined } from '../types';
import { useSignalR } from '../signalRProvider';
import type { Config, EventName, HandlerValues, UseSignalREventResult } from './type';


const getInitialData = <Event extends EventName>(): MapToUndefined<HandlerValues<Event>> => {
  return [] as unknown as MapToUndefined<HandlerValues<Event>>;
};

export const useSignalREvent = <Event extends EventName>(
  methodName: Event,
  { handler }: Config<Event> = {},
): UseSignalREventResult<Event> => {
  const { connection, isConnected } = useSignalR();
  const [data, setData] = useState<MapToUndefined<HandlerValues<Event>>>(getInitialData<Event>());

  useEffect(() => {
    if (!isConnected || !connection) {
      return;
    }

    const callback = (...values: readonly unknown[]) => {
      setData(values as MapToUndefined<HandlerValues<Event>>);
      if (handler) {
        handler(...(values as HandlerValues<Event>));
      }
    };

    connection.on(methodName as string, callback);

    return () => {
      connection.off(methodName as string, callback);
    };
  }, [isConnected, connection, methodName, handler]);

  return { data, connection };
};

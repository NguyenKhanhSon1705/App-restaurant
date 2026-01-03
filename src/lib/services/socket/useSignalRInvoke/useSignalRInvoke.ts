import { ESignalRError } from '@/common/enum';
import * as signalR from '@microsoft/signalr';
import { useCallback } from 'react';
import { isRetryableError, retry } from '../retry';
import { useSignalR } from '../signalRProvider';
import type { EventName, InvokeArguments, UseSignalRInvoke } from './type';
export const useSignalRInvoke: UseSignalRInvoke = () => {
  const { connection, isConnected  } = useSignalR();

  const invoke = useCallback(
    async <Event extends EventName>(
      methodName: Event,
      ...args: InvokeArguments<Event>
    ) => {
      if (!connection) {
        throw new Error(ESignalRError.CONNECTION_NOT_ESTABLISHED);
      }

      if (connection.state !== signalR.HubConnectionState.Connected) {
        throw new Error(
          `Cannot invoke "${methodName}". Connection state: ${signalR.HubConnectionState[connection.state]}`
        );
      }

      await retry(
        () => connection.invoke(methodName as string, ...args),
        {
          maxRetries: 3,
          delay: 500,
          backoffMultiplier: 2,
          shouldRetry: isRetryableError,
        }
      );
    },
    [connection, isConnected],
  );

  return { invoke, connection, isConnected };
};

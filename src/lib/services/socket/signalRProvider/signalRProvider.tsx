'use client';
import { ESignalRActionType, ESignalRConnectionError } from '@/common/enum';
import { useAppSelector } from '@/lib/hooks';
import * as signalR from '@microsoft/signalr';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { isRetryableError, retry } from '../retry';
import { useSignalRReducer } from '../signalRReducer';
import type { SignalRContextValues, SignalRProviderProps } from './signalRProvider.type';

const SignalRContext = createContext<SignalRContextValues | undefined>(undefined);

export const SignalRProvider = ({
  children,
  url,
  options,
}: SignalRProviderProps) => {
  const [state, dispatch] = useSignalRReducer();
  const [connection, setConnection] = useState<signalR.HubConnection | null>(null);
  const token = useAppSelector((state) => state.auth.token.accessToken);
  const handlersRegisteredRef = useRef(false);
  const connectionRef = useRef<signalR.HubConnection | null>(null);
  const tokenUsedForConnectionRef = useRef<string | undefined>(undefined);

  const stopConnection = useCallback(async (conn: signalR.HubConnection | null) => {
    if (conn && conn.state !== signalR.HubConnectionState.Disconnected) {

      await conn.stop().catch((res) => {
        console.error('Error stopping SignalR connection:', res);
      });
    }
  }, []);

  const cleanupConnection = useCallback(() => {
    connectionRef.current = null;
    tokenUsedForConnectionRef.current = undefined;
    handlersRegisteredRef.current = false;
    setConnection(null);
  }, []);

  const disconnectWithError = useCallback((error: string) => {
    dispatch({
      type: ESignalRActionType.DISCONNECT,
      payload: error,
    });
  }, [dispatch]);

  const createHubConnection = useCallback((accessToken: string): signalR.HubConnection => {
    const connectionOptions: signalR.IHttpConnectionOptions = {
      ...options,
      transport: signalR.HttpTransportType.WebSockets,
      skipNegotiation: true,
      accessTokenFactory: () => accessToken,
    };

    return new signalR.HubConnectionBuilder()
      .withUrl(url, connectionOptions)
      .withAutomaticReconnect()
      // .configureLogging(signalR.LogLevel.Trace)
      .build();
  }, [url, options]);

  const handleConnectionClose = useCallback((error?: Error) => {
    handlersRegisteredRef.current = false;
    if (error) {
      dispatch({
        type: ESignalRActionType.ERROR,
        payload: error.message,
      });
    } else {
      dispatch({
        type: ESignalRActionType.DISCONNECT,
        payload: ESignalRConnectionError.CONNECTION_CLOSED,
      });
    }
  }, [dispatch]);

  const handleReconnecting = useCallback((error?: Error) => {
    dispatch({
      type: ESignalRActionType.ERROR,
      payload: error?.message || ESignalRConnectionError.RECONNECTING,
    });
  }, [dispatch]);

  const handleReconnected = useCallback(() => {
    dispatch({ type: ESignalRActionType.CONNECTED });
  }, [dispatch]);

  const handleConnectionError = useCallback((error: Error) => {
    handlersRegisteredRef.current = false;
    dispatch({
      type: ESignalRActionType.ERROR,
      payload: error.message,
    });
  }, [dispatch]);


  const registerEventHandlers = useCallback((conn: signalR.HubConnection) => {
    conn.onclose(handleConnectionClose);
    conn.onreconnecting(handleReconnecting);
    conn.onreconnected(handleReconnected);
  }, [handleConnectionClose, handleReconnecting, handleReconnected]);

  const startConnection = useCallback(async (conn: signalR.HubConnection) => {
    dispatch({ type: ESignalRActionType.CONNECTING });
    handlersRegisteredRef.current = true;
    registerEventHandlers(conn);

    try {
      await retry(
        () => conn.start(),
        {
          maxRetries: 3,
          delay: 1000,
          backoffMultiplier: 2,
          shouldRetry: isRetryableError,
        }
      );
      dispatch({ type: ESignalRActionType.CONNECTED });
    } catch (error) {
      handlersRegisteredRef.current = false;
      handleConnectionError(error as Error);
    }
  }, [dispatch, registerEventHandlers, handleConnectionError]);


  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (!token) {
      if (connectionRef.current) {
        stopConnection(connectionRef.current);
        cleanupConnection();
        disconnectWithError(ESignalRConnectionError.NO_ACCESS_TOKEN);
      }
      return;
    }

    const isSameToken = tokenUsedForConnectionRef.current === token;
    if (connectionRef.current && isSameToken) {
      return;
    }

    if (connectionRef.current && !isSameToken) {
      stopConnection(connectionRef.current);
      cleanupConnection();
    }

    const initConnection = async () => {
      const newConnection = createHubConnection(token);
      connectionRef.current = newConnection;
      tokenUsedForConnectionRef.current = token;
      setConnection(newConnection);

      await startConnection(newConnection);
    };

    initConnection();

    return () => {
      if (connectionRef.current && !handlersRegisteredRef.current) {
        stopConnection(connectionRef.current);
        cleanupConnection();
      }
    };
  }, [url, token, options, stopConnection, cleanupConnection, disconnectWithError, createHubConnection, startConnection]);


  return (
    <SignalRContext.Provider value={{ connection, ...state }}>
      {children}
    </SignalRContext.Provider>
  );
};

export const useSignalR = () => {
  const value = useContext(SignalRContext);

  if (!value) {
    throw new Error("SignalRContext hasn't been provided");
  }

  return useMemo(() => value, [value]);
}
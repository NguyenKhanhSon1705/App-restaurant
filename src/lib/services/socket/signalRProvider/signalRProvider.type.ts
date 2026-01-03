import type { ReactNode } from "react";
import type * as signalR from '@microsoft/signalr';
import type { SignalRState } from "../signalRReducer/signalRReducer.type";

export type SignalRContextValues = {
  readonly connection: signalR.HubConnection | null;
} & SignalRState;


export type SignalRProviderProps = {
  readonly children: ReactNode;
  readonly url: string;
  readonly options?: signalR.IHttpConnectionOptions;
};
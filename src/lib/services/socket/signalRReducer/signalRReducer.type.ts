import { ESignalRActionType } from "@/common/enum";

export type SignalRState = {
  readonly isConnected: boolean;
  readonly isConnecting: boolean;
  readonly error: string | null;
};

export type SignalRAction =
  | { type: ESignalRActionType.CONNECTING }
  | { type: ESignalRActionType.CONNECTED }
  | { type: ESignalRActionType.DISCONNECT; payload: string }
  | { type: ESignalRActionType.ERROR; payload: string };
import { MemoriaSignalEvent } from "@/common/types";

// import type { INotifiRealtimeItem } from '../modules/notificationRealtimeService/type';
export type EventNameString = string & { readonly __brand?: never };

export type EventsOf<Handlers> = keyof Handlers | EventNameString;

export type MapToUndefined<Tuple extends readonly unknown[]> = {
  readonly [Key in keyof Tuple]: Tuple[Key] | undefined;
};

export interface ServerToClientEvents {
  JoinedBackupGroup: (data: { backupId: string; timestamp: string }) => void;
  SubscribedToSession: (data: { sessionId: string; timestamp: string }) => void;
  SubscribedToThumbnails: (data: { timestamp: string }) => void;
  // BackupSignal: (payload: MemoriaSignalEvent<IDevice | string>) => void;
  ReceiveNotification: (payload: MemoriaSignalEvent<string>) => void;
}

export interface ClientToServerEvents {
  JoinBackupGroup: (backupId: string) => Promise<void>;
  LeaveBackupGroup: (backupId: string) => Promise<void>;
  SubscribeToBackupSession: (sessionId: string) => Promise<void>;
  UnsubscribeFromBackupSession: (sessionId: string) => Promise<void>;
  SubscribeToTopic: (topic: string) => Promise<void>;
  UnsubscribeFromTopic: (topic: string) => Promise<void>;
  SubscribeToThumbnailProgress: () => Promise<void>;
  SubscribeToFileProcessing: (fileId: number) => Promise<void>;
  UnsubscribeFromFileProcessing: (fileId: number) => Promise<void>;
}
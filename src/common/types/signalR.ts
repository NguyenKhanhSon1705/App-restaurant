import { ESignalEvent } from "../enum"

export interface MemoriaSignalEvent<T> {
    type: ESignalEvent
    data: T
}
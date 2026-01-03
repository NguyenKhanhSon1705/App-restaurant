
import { useReducer, type Reducer } from 'react';
import type { SignalRAction, SignalRState } from './signalRReducer.type';
import { ESignalRActionType } from '@/common/enum';



const initialState: SignalRState = {
  isConnected: false,
  isConnecting: false,
  error: null,
};

const reducer: Reducer<SignalRState, SignalRAction> = (state, action) => {
  switch (action.type) {
    case ESignalRActionType.CONNECTING:
      return { ...state, isConnecting: true, error: null };
    case ESignalRActionType.CONNECTED:
      return { isConnected: true, isConnecting: false, error: null };
    case ESignalRActionType.DISCONNECT:
      return { isConnected: false, isConnecting: false, error: action.payload };
    case ESignalRActionType.ERROR:
      return { ...state, isConnecting: false, error: action.payload };
    default:
      return state;
  }
};

export const useSignalRReducer = () => {
  return useReducer(reducer, initialState);
};

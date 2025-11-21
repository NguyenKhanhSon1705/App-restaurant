import authSlice, { initialAuthState } from '@/lib/features/authSlice';
import userSlice from '@/lib/features/userSlice';
import { apiSlice } from '@/lib/services/api';
import { combineReducers } from '@reduxjs/toolkit';
import { persistReducer } from 'redux-persist';
import cookieStorage from './cookieStorage';

import { UPDATE_ACCESS_TOKEN, USER_LOGOUT } from '@/common/utils';
import type { IAuthState } from '@/lib/features/authSlice/type';
import type { AnyAction, Reducer } from 'redux';
import type { Storage } from 'redux-persist';

const persist = (key: string, storage: Storage, reducer: Reducer) => persistReducer({ key, storage }, reducer);


const reducerAuthProxy = (state: IAuthState, action: AnyAction) => {
  if (action.type === USER_LOGOUT) {
    return authSlice(initialAuthState, action);
  }
  if (action.type === UPDATE_ACCESS_TOKEN) {
    return authSlice({ ...state, token: {
      accessToken: action.payload.accessToken,
      refreshToken: state.token.refreshToken,
    } }, action);
  }
  return authSlice(state, action);
};

export default combineReducers({
  user: persist('user', cookieStorage, userSlice),
  auth: persist('auth', cookieStorage, reducerAuthProxy),
  [apiSlice.reducerPath]: apiSlice.reducer,
});

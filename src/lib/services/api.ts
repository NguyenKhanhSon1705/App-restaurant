import { UPDATE_ACCESS_TOKEN, USER_LOGOUT } from "@/common/utils";
import env from "@/constant/envConstant";
import type { Action } from "@reduxjs/toolkit";
import {
  type BaseQueryFn,
  type FetchArgs,
  type FetchBaseQueryError,
  createApi,
  fetchBaseQuery,
} from "@reduxjs/toolkit/query/react";
import { Mutex } from "async-mutex";
import { REHYDRATE } from "redux-persist";
import type { ILoginResponse } from "./modules/authService/type";
import type { RootState } from "./store";
import API_SERVICE_PREFIX from "./utils/apiServicePrefix";

const baseQuery = fetchBaseQuery({
  baseUrl: `${env.API_URL}`,
  prepareHeaders: (headers, { getState, endpoint }) => {
    const token = (getState() as RootState).auth.token;
    headers.set("current-version", "1.00");
    // THAY ĐỔI: Đổi client-type thành "mobile" hoặc "app" cho React Native
    headers.set("client-type", "mobile");
    headers.set("Content-Type", "application/json");
    headers.set("Accept-Encoding", "gzip, deflate");
    headers.set("Connection", "keep-alive");
    headers.set("Accept", "*/*");
    if (token?.accessToken) {
      headers.set("Authorization", `Bearer ${token.accessToken}`);
    }
    return headers;
  },
});

const mutex = new Mutex();

const baseQueryWithInterceptor: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (
  args,
  api,
  extraOptions,
) => {
  await mutex.waitForUnlock();
  let result = await baseQuery(args, api, extraOptions);
  if (
    result.error &&
    (result.error.status === 401 || result.error.status === 403) &&
    api.endpoint !== "sign-in" &&
    api.endpoint !== "sign-up"
  ) {
    if (mutex.isLocked()) {
      await mutex.waitForUnlock();
      result = await baseQuery(args, api, extraOptions);
    } else {
      const release = await mutex.acquire();
      const token = (api.getState() as RootState).auth.token.refreshToken;
      try {
        const refreshResult = (await baseQuery(
          {
            url: `${API_SERVICE_PREFIX.auth}/refresh-token`,
            method: "POST",
            body: {
              refreshToken: token || "null",
            },
          },
          api,
          extraOptions
        )) as { data: ILoginResponse };

        if (refreshResult.data) {
          api.dispatch({
            type: UPDATE_ACCESS_TOKEN,
            payload: refreshResult.data,
          });
          result = await baseQuery(args, api, extraOptions);
        } else {
          api.dispatch({ type: USER_LOGOUT });
          // XÓA BỎ: Không thể dùng window.location.href trong React Native
          // window.location.href = "/"; 

          // GHI CHÚ: Việc điều hướng về màn hình Login nên được xử lý
          // ở tầng UI (ví dụ: trong App.tsx hoặc NavigationContainer)
          // bằng cách lắng nghe action USER_LOGOUT.
        }
      } catch (_e) {
        api.dispatch({ type: USER_LOGOUT });
        // XÓA BỎ: Không thể dùng window.location.href trong React Native
        // window.location.href = "/";

        // GHI CHÚ: Tương tự như trên, xử lý điều hướng ở tầng UI.
      } finally {
        release();
      }
    }
  }
  return result;
};


function isHydrateAction(action: Action): action is Action<typeof REHYDRATE> & {
  key: string
  payload: RootState
  err: unknown
} {
  return action.type === REHYDRATE
}

export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithInterceptor,
  tagTypes: ['TableDish', 'TableArea'],
  extractRehydrationInfo(action, { reducerPath }): any {
    if (isHydrateAction(action)) {
      if (action.key === 'key used with redux-persist') {
        return action.payload
      }
      return undefined
    }
  },
  endpoints: (_build) => ({}),
});
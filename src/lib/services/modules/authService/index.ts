import { IApiResponse } from '@/common/types';
import { apiSlice } from '@/lib/services/api';
import API_SERVICE_PREFIX from '../../utils/apiServicePrefix';
import { ILoginPayload, ILoginResponse } from './type';

const auth = API_SERVICE_PREFIX.auth;
export const authApi = apiSlice.injectEndpoints({
  endpoints: (build) => ({
    login: build.mutation<IApiResponse<ILoginResponse>, ILoginPayload>({
      query: (body) => ({
        url: `${auth}/login`,
        method: 'POST',
        body,
      }),
    })
  }),
});

export const {
  useLoginMutation
} = authApi;

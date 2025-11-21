import type { IUser } from '@/common/types';
import { apiSlice } from '../../api';
import API_SERVICE_PREFIX from '../../utils/apiServicePrefix';

const user = API_SERVICE_PREFIX.user;

export const userApi = apiSlice.injectEndpoints({
  endpoints: (build) => ({
    getListUser: build.query<IUser[], void>({
      query: () => user,
    }),
    fetchCurrentUser: build.query<IUser, null>({
      query: () => ({
        url: `${user}/current-user`,
        method: 'GET',
      }),
    }),
  }),
});

export const { 
  useGetListUserQuery,
  useFetchCurrentUserQuery,
  useLazyGetListUserQuery,
 } = userApi;

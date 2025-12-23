import type { IApiResponse, IUser } from '@/common/types';
import { getIdShopFromStorage } from '@/common/utils';
import { apiSlice } from '../../api';
import API_SERVICE_PREFIX from '../../utils/apiServicePrefix';

const user = API_SERVICE_PREFIX.auth;

export const userApi = apiSlice.injectEndpoints({
  endpoints: (build) => ({
    getListUser: build.query<IUser[], void>({
      query: () => user,
    }),
    fetchCurrentUser: build.query<IApiResponse<IUser>, null>({
      async queryFn(data, _queryApi, _extraOptions, baseQuery) {
        const idShop = await getIdShopFromStorage();
        const result = await baseQuery({
          url: `${user}/get-current-user?shopId=${idShop}`,
          method: 'GET',
        });

        if (result.error) return { error: result.error };
        return { data: result.data as IApiResponse<IUser> };
      },

    }),
  }),
});

export const {
  useGetListUserQuery,
  useFetchCurrentUserQuery,
  useLazyGetListUserQuery,
} = userApi;

import type { IApiResponse } from '@/common/types';
import { getIdShopFromStorage } from '@/common/utils';
import { apiSlice } from '../../api';
import API_SERVICE_PREFIX from '../../utils/apiServicePrefix';
// import { IAddAreaData, IAreaData } from './type';
import { IMenuGroupInfo } from '@/modules/tableDish/components/tableDish.type';

const menuGroup = API_SERVICE_PREFIX.menuGroup;

export const menuGroupApi = apiSlice.injectEndpoints({
    endpoints: (build) => ({
        getMenuGroupInfo: build.query<IApiResponse<IMenuGroupInfo[]>, void>({
            async queryFn(arg, _queryApi, _extraOptions, baseQuery) {
                const idShop = await getIdShopFromStorage();
                const result = await baseQuery({
                    url: `${menuGroup}/get-all-name-menu-group`,
                    method: 'GET',
                    params: {
                        shopId: idShop,
                    },
                });

                if (result.error) {
                    return { error: result.error };
                }

                return { data: result.data as IApiResponse<IMenuGroupInfo[]> };
            },
        }),
        

    }),
});

export const {
    useGetMenuGroupInfoQuery
} = menuGroupApi;

import type { IApiResponse } from '@/common/types';
import { getIdShopFromStorage } from '@/common/utils';
import { apiSlice } from '../../api';
import API_SERVICE_PREFIX from '../../utils/apiServicePrefix';
// import { IAddAreaData, IAreaData } from './type';
import { IDishData, IDishDTO } from '@/modules/tableDish/components/tableDish.type';

const dish = API_SERVICE_PREFIX.dish;

export const dishApi = apiSlice.injectEndpoints({
    endpoints: (build) => ({
        getAllDish: build.query<IApiResponse<IDishData>, IDishDTO>({
            async queryFn(arg, _queryApi, _extraOptions, baseQuery) {
                const idShop = await getIdShopFromStorage();
                const result = await baseQuery({
                    url: `/api/dish/get-dish-menugroup`,
                    method: 'GET',
                    params: {
                        pageIndex: arg.pageIndex,
                        pageSize: arg.pageSize,
                        search: arg.search ?? '',
                        menuGroupId: arg.menuGroupId ?? '',
                        shopId: idShop,
                    },
                });

                if (result.error) {
                    return { error: result.error };
                }

                return { data: result.data as IApiResponse<IDishData> };
            },
        }),

    }),
});

export const {
    useGetAllDishQuery
} = dishApi;

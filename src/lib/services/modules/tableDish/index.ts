import type { IApiResponse } from '@/common/types';
import { getIdShopFromStorage } from '@/common/utils';
import { apiSlice } from '../../api';
import API_SERVICE_PREFIX from '../../utils/apiServicePrefix';
import { IAbortOrder, ITableDishData, ITableDishDTO } from './type';

const tableDish = API_SERVICE_PREFIX.tableDish;

export const tableApi = apiSlice.injectEndpoints({
    endpoints: (build) => ({
        getTableDishData: build.query<IApiResponse<ITableDishData>, number>({
            query: (body) => ({
                url: `${tableDish}/get-dish-table?tableId=${body}`,
                method: 'GET'
            })
        }),

        createTableDish: build.mutation<IApiResponse<ITableDishData>, ITableDishDTO>({
            query: (body) => ({
                url: `${tableDish}/open-table-dish`,
                method: "POST",
                body
            })
        }),

        updateTableDish: build.mutation<IApiResponse<ITableDishData>, ITableDishDTO>({
            query: (body) => ({
                url: `${tableDish}/update-dish-table`,
                method: "POST",
                body
            })
        }),
        abortTableDish: build.mutation<IApiResponse<ITableDishData>, IAbortOrder>({
            async queryFn(data, _queryApi, _extraOptions, baseQuery) {
                const idShop = await getIdShopFromStorage();
                const result = await baseQuery({
                    url: `${tableDish}/aborted-table`,
                    method: 'POST',
                    body: {
                        "shop_id": idShop,
                        "table_Id": Number(data.table_Id),
                        "reason_abort": data.reason_abort,
                        "total_money": data.total_money,
                        "total_quantity": data.total_quantity
                    },
                });

                if (result.error) return { error: result.error };
                return { data: result.data as IApiResponse<ITableDishData> };
            },
        }),

    }),
});

export const {
    useGetTableDishDataQuery,
    useLazyGetTableDishDataQuery,
    useUpdateTableDishMutation,
    useCreateTableDishMutation,
    useAbortTableDishMutation
} = tableApi;

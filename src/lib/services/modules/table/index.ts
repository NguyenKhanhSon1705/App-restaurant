import type { IApiResponse } from '@/common/types';
import { getIdShopFromStorage } from '@/common/utils';
import { apiSlice } from '../../api';
import API_SERVICE_PREFIX from '../../utils/apiServicePrefix';
import { IAddTable, ITableData } from './type';

const table = API_SERVICE_PREFIX.table;

export const tableApi = apiSlice.injectEndpoints({
    endpoints: (build) => ({
        getTableData: build.query<IApiResponse<ITableData[]>, void>({
            async queryFn(_arg, _queryApi, _extraOptions, baseQuery) {
                const idShop = await getIdShopFromStorage();
                const result = await baseQuery({
                    url: `${table}/get-table-area?shopId=${idShop}`,
                    method: 'GET',
                });
                if (result.error) {
                    return { error: result.error };
                }

                return { data: result.data as IApiResponse<ITableData[]> };
            },
        }),
        createTable: build.mutation<IApiResponse<ITableData>, IAddTable>({
            query: (body) => ({
                url: `${table}/create-tables`,
                method: "POST",
                body
            })
        }),
        updateTable: build.mutation<IApiResponse<ITableData>, IAddTable>({
            query: (body) => ({
                url: `${table}/update-tables`,
                method: "PUT",
                body
            })
        }),
        deleteTable: build.mutation<IApiResponse<ITableData>, number>({
            query: (body) => ({
                url: `${table}/delete-tables?id=${body}`,
                method: "DELETE",
            }),
        }),

    }),
});

export const {
    useGetTableDataQuery,
    useCreateTableMutation,
    useUpdateTableMutation,
    useDeleteTableMutation
} = tableApi;

import type { IApiResponse } from '@/common/types';
import { apiSlice } from '../../api';
import API_SERVICE_PREFIX from '../../utils/apiServicePrefix';
import { ITableAreaData } from './type';

const tableArea = API_SERVICE_PREFIX.tableArea;

export const tableAreaApi = apiSlice.injectEndpoints({
    endpoints: (build) => ({
        getTableAreaData: build.query<IApiResponse<ITableAreaData[]>, number | undefined>({
            query: (body) => ({
                url: `${tableArea}/get-tables-by-area?areaId=${body}`,
                method: 'GET'
            }),
            providesTags: ['TableArea']
        })
    }),
});

export const {
    useGetTableAreaDataQuery
} = tableAreaApi;

import type { IApiResponse } from '@/common/types';
import { getIdShopFromStorage } from '@/common/utils';
import { apiSlice } from '../../api';
import API_SERVICE_PREFIX from '../../utils/apiServicePrefix';
import { IAddAreaData, IAreaData } from './type';

const area = API_SERVICE_PREFIX.area;

export const areaApi = apiSlice.injectEndpoints({
    endpoints: (build) => ({
        getAreaData: build.query<IApiResponse<IAreaData[]>, void>({
            async queryFn(_arg, _queryApi, _extraOptions, baseQuery) {
                const idShop = await getIdShopFromStorage();
                const result = await baseQuery({
                    url: `${area}/get-list-areas?idShop=${idShop}`,
                    method: 'GET',
                });

                if (result.error) {
                    return { error: result.error };
                }

                return { data: result.data as IApiResponse<IAreaData[]> };
            },
        }),
        createArea: build.mutation<IApiResponse<IAreaData>, IAddAreaData>({
            query: (body) => ({
                url: `${area}/create-area`,
                method: "POST",
                body
            })
        }),
        updateArea: build.mutation<IApiResponse<IAreaData>, IAddAreaData>({
            query: (body) => ({
                url: `${area}/update-area`,
                method: "PUT",
                body
            })
        }),
        deleteArea: build.mutation<IApiResponse<IAreaData>, number>({
            query: (body) => ({
                url: `${area}/delete-area?id=${body}`,
                method: "DELETE",
            }),
        }),

    }),
});

export const {
    useGetAreaDataQuery,
    useCreateAreaMutation,
    useUpdateAreaMutation,
    useDeleteAreaMutation
} = areaApi;

import type { IApiResponse } from '@/common/types';
import { apiSlice } from '../../api';
import API_SERVICE_PREFIX from '../../utils/apiServicePrefix';
import { IDeleteShopPayload, IShopData } from './type';

const switchRestaurant = API_SERVICE_PREFIX.switchRestaurant;

export const switchRestaurantApi = apiSlice.injectEndpoints({
    endpoints: (build) => ({
        getListShopUser: build.query<IApiResponse<IShopData[]>, null>({
            query: () => ({
                url: `${switchRestaurant}/get-list-shop`,
                method: 'GET'
            })
        }),
        createShop: build.mutation<IApiResponse<IShopData>, FormData>({
            query: (body) => ({
                url: `${switchRestaurant}/create-shop`,
                method: 'POST',
                body
            })
        }),
        updateShop: build.mutation<IApiResponse<IShopData>, FormData>({
            query: (body) => ({
                url: `${switchRestaurant}/update-shop`,
                method: 'PUT',
                body
            })
        }),
        deleteShop: build.mutation<IApiResponse<IShopData>, IDeleteShopPayload>({
            query: (body) => ({
                url: `${switchRestaurant}/delete-shop?id=${body.id}&password=${body.password}`
            })
        })
    }),
});

export const {
    useGetListShopUserQuery,
    useUpdateShopMutation,
    useCreateShopMutation,
    useDeleteShopMutation
} = switchRestaurantApi;

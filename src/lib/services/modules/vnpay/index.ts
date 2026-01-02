import { apiSlice } from '../../api';
import API_SERVICE_PREFIX from '../../utils/apiServicePrefix';
import { IVnPayPaymentDTO } from './type';

const vnpay = API_SERVICE_PREFIX.vnpay;

export const vnpayApi = apiSlice.injectEndpoints({
    endpoints: (build) => ({
        createPaymentUrl: build.query<string, IVnPayPaymentDTO>({
            query: (params) => ({
                url: `${vnpay}/createpaymenturl`,
                method: 'GET',
                params
            }),
            transformResponse: (response: any) => response.data
        }),
    }),
});

export const {
    useLazyCreatePaymentUrlQuery
} = vnpayApi;

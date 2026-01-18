import { IApiResponse } from "@/common/types";
import { getIdShopFromStorage } from "@/common/utils";
import { apiSlice } from "../../api";
import API_SERVICE_PREFIX from "../../utils/apiServicePrefix";
import { IReportBillData, IReportBillDetail, IReportBillPayload } from "./type";

const report = API_SERVICE_PREFIX.report;

export const reportApi = apiSlice.injectEndpoints({
    endpoints: (build) => ({
        getAllReportBill: build.query<IApiResponse<IReportBillData>, IReportBillPayload>({
            async queryFn(arg, _queryApi, _extraOptions, baseQuery) {
                const idShop = await getIdShopFromStorage();
                const result = await baseQuery({
                    url: `${report}/report-bill`,
                    method: "GET",
                    params: {
                        shop_id: idShop,
                        start_date: arg.start_date,
                        end_date: arg.end_date,
                        employee_id: arg.employee_id,
                        page_index: arg.page_index,
                        limit: arg.limit,
                        search_bill_code: arg.search_bill_code,
                    },
                });

                if (result.error) {
                    return { error: result.error };
                }

                return { data: result.data as IApiResponse<IReportBillData> };
            },
            providesTags: ["Report"],
        }),
        getReportBillDetail: build.query<IApiResponse<IReportBillDetail>, { id: string }>({
            query: (params) => ({
                url: `${API_SERVICE_PREFIX.report}/report-bill-detail`,
                params,
            }),
        }),
    }),
});

export const { useGetAllReportBillQuery, useGetReportBillDetailQuery } = reportApi;

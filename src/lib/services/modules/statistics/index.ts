import { IApiResponse } from "@/common/types";
import { getIdShopFromStorage } from "@/common/utils";
import { apiSlice } from "../../api";
import API_SERVICE_PREFIX from "../../utils/apiServicePrefix";
import { IRevenueReportData, IRevenueReportPayload } from "./type";

const report = API_SERVICE_PREFIX.report;

export const statisticsApi = apiSlice.injectEndpoints({
    endpoints: (build) => ({
        getRevenueReport: build.query<IApiResponse<IRevenueReportData>, IRevenueReportPayload>({
            async queryFn(arg, _queryApi, _extraOptions, baseQuery) {
                const idShop = await getIdShopFromStorage();
                const result = await baseQuery({
                    url: `${report}/report-revenue`,
                    method: "GET",
                    params: {
                        shop_id: idShop,
                        start_date: arg.start_date,
                        end_date: arg.end_date,
                    },
                });

                if (result.error) {
                    return { error: result.error };
                }

                return { data: result.data as IApiResponse<IRevenueReportData> };
            },
            providesTags: ["Report"],
        }),
    }),
});

export const { useGetRevenueReportQuery } = statisticsApi;

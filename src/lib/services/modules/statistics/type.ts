export interface IRevenueReportPayload {
    start_date?: string;
    end_date?: string;
}

export interface IDishInfo {
    id: number;
    dish_Name: string;
    quantity: number;
    image: string | null;
    selling_Price: number;
}

export interface IRevenueReportData {
    total_nuvenue: number;
    total_transaction_online: number;
    pendding_nuvenue: number;
    total_billed: number;
    pendding_bill: number;
    total_aborted_money: number;
    total_aborted: number;
    total_aborted_dish: number;
    list_dish_hot: IDishInfo[];
    list_dish_not_hot: IDishInfo[];
}

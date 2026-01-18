
export interface IReportBillPayload {
    shop_id?: string;
    start_date?: string | null;
    end_date?: string | null;
    employee_id?: string | null;
    page_index?: number;
    limit?: number;
    search_bill_code?: string | null;
}

export interface IReportBillItem {
    id: string;
    bill_code: string;
    user_name: string;
    table_name: string;
    area_name: string;
    total_money: number;
    total_quantity: number;
    time_start: string;
    time_end: string;
    discount: number;
    vat: number;
}

export interface IReportBillData {
    items: IReportBillItem[];
    totalItems: number;
    totalPages: number;
    currentPage: number;
}

export interface IReportBillDetailItem {
    image: string | null;
    dish_name: string;
    quantity: number;
    notes: string | null;
    price: number;
}

export interface IReportBillDetail {
    list_item: IReportBillDetailItem[];
    payment_method: string;
    description: string;
    payment_date: string;
}

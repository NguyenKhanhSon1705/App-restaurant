export interface IShopData {
    id: number;
    shopName: string;
    shopPhone: string;
    shopLogo: string;
    shopAddress: string;
    isActive: boolean;
}

export interface IDeleteShopPayload{
    id: number,
    password: string
}

interface IUser {
  id: string;
  email: string;
  fullName: string;
  picture?: string;
  shopId?: number;
  shopName?: string,
  shopLogo?: string,
  isActive: boolean
}
 
export type { IUser };


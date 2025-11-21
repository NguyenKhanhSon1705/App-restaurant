import env from '@/constant/envConstant';
import AsyncStorage from '@react-native-async-storage/async-storage';

export async function getIdShopFromStorage() {

  try {
    // 1. Lấy dữ liệu dạng chuỗi (string) từ AsyncStorage
    const idShop = await AsyncStorage.getItem(env.SHOP_ID);

    // 2. Kiểm tra nếu không có dữ liệu
    if (!idShop) return null;

    return idShop;

  } catch (error) {
    console.error("Error parsing auth from storage:", error);
    return null;
  }
}
import AsyncStorage from '@react-native-async-storage/async-storage';

export async function getAuthFromStorage() {
  // Tên key trong AsyncStorage, tương đương với tên cookie của bạn
  const authKey = "persist:auth";

  try {
    // 1. Lấy dữ liệu dạng chuỗi (string) từ AsyncStorage
    const rawAuth = await AsyncStorage.getItem(authKey);

    // 2. Kiểm tra nếu không có dữ liệu
    if (!rawAuth) return null;

    // 3. Parse chuỗi JSON chính
    const auth = JSON.parse(rawAuth);

    // 4. Kiểm tra trường token (giống logic của bạn)
    if (!auth?.token) return null;

    // 5. Parse trường token bên trong (giống logic của bạn)
    // Điều này giả định rằng auth.token cũng là một chuỗi JSON
    const token = JSON.parse(auth.token);
    
    // 6. Gán lại token đã được parse vào đối tượng auth
    auth.token = token;
    
    return auth;

  } catch (error) {
    console.error("Error parsing auth from storage:", error);
    return null;
  }
}
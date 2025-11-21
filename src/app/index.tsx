// import { Button } from "@react-navigation/elements";
import GuestGuard from "@/common/guards/GuestGuard";
import { router } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { Avatar, Button } from "react-native-paper";
import { images } from "../assets/images";
import { ROUTE } from "../routers";

export default function Index() {

  const nextPage = () => {
    router.push(ROUTE.LOGIN)
  }

  return (
    <GuestGuard>
      <View style={style.container}>
        <Avatar.Image
          source={images.logo}
          size={200}
          style={{ backgroundColor: "transparent" }}
        ></Avatar.Image>
        <Text>Chào mừng bạn đến với ứng dụng quản lý cửa hàng</Text>
        <View style={style.button}>
          <Button
            onPress={nextPage}
            contentStyle={{ flexDirection: "row-reverse" }}
            labelStyle={{ fontSize: 18, padding: 4 }}
            icon='account-arrow-right-outline'
            mode={"outlined"}
          >Bắt đầu</Button>
        </View>
      </View>
    </GuestGuard>
  );
}

const style = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  button: {
    position: "absolute",
    bottom: 40,
    width: 300
  }
})
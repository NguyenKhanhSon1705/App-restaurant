import { createImageFormData } from "@/common/utils";
import env from "@/constant/envConstant";
import { UIButtonBack } from "@/core/ui";
import { useGetListShopUserQuery } from "@/lib/services/modules";
import storage from "@/lib/services/store/cookieStorage";
import { ROUTE } from "@/routers";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import styled from "styled-components/native";
import ChooseShopItem from "./components/chooseShopItem";
import PasswordConfirmModal from "./components/PasswordConfirmModal";
import ShopModal from "./components/ShopModal";
import { IShopData } from "./switchRestaurant.type";

export default function SwitchRestaurantPage () {
    const [editShop, setEditShop] = useState<IShopData | undefined>(undefined);
    const [passwordModalVisible, setPasswordModalVisible] = useState(false);
    const [shopToDelete, setShopToDelete] = useState<IShopData | null>(null);
    const [modalVisible, setModalVisible] = useState(false);
    const {data} = useGetListShopUserQuery(null)
    const router = useRouter()
     const handleGotoShop = async (id: number) => {
        await storage.setItem(env.SHOP_ID, id.toString())
        router.replace(ROUTE.TABLE_AREA);
    };


    const handleSubmit = (data: IShopData) => {
        const formData = createImageFormData(data);
        // if (editShop) {
        //     dispatch(shopAction.updateShop(formData));
        // } else {
        //     dispatch(shopAction.createShop(formData));
        // }
        setModalVisible(false);
        setEditShop(undefined);
    };

    const handleEdit = (shop: IShopData) => {
        setEditShop(shop);
        setModalVisible(true);
    };

    const handleDelete = (shop: IShopData) => {
        setShopToDelete(shop);
        setPasswordModalVisible(true);
    };

    const handleConfirmDelete = async (password: string) => {
        try {
            // await dispatch(shopAction.deleteShop({
            //     id: shopToDelete?.id ?? 0,
            //     password
            // }));
            // dispatch(shopAction.getListShopUser());
            setPasswordModalVisible(false);
            setShopToDelete(null);
        } catch (error) {
            console.error('Error deleting shop:', error);
        }
    };


    return (
         <Container>
            {/* {loading && <LoadingOverlay />} */}
            <ContainerHeader>
                <View style={{ marginLeft: 12 }}>
                    <UIButtonBack />
                </View>
                <View
                    style={{
                        marginRight: 12
                    }}
                >
                    <TouchableOpacity
                        style={{
                            backgroundColor: "#f1f3f6",
                            width: 36,
                            height: 36,
                            borderRadius: 50,
                            justifyContent: "center",
                            alignItems: "center",
                            shadowColor: "#000",
                            shadowOffset: { width: 0, height: 1 },
                            shadowOpacity: 0.1,
                            shadowRadius: 2,
                            margin: 10,
                            elevation: 3,
                        }}
                        onPress={() => {
                            setEditShop(undefined);
                            setModalVisible(true);
                        }}
                    >
                        <MaterialIcons name="add" size={20} color="#2c2c2c" />
                    </TouchableOpacity>
                </View>
            </ContainerHeader>
            {
                data?.data?.map((item: IShopData) => {
                    return (
                        <ChooseShopItem
                            key={item.id}
                            propsItem={item}
                            onPressIdShop={handleGotoShop}
                            onPressEdit={handleEdit}
                            onPressDelete={handleDelete}
                        />
                    );
                })
            }
            <ShopModal
                visible={modalVisible}
                onClose={() => {
                    setModalVisible(false);
                    setEditShop(undefined);
                }}
                onSubmit={handleSubmit}
                editData={editShop}
            />
            <PasswordConfirmModal
                visible={passwordModalVisible}
                onClose={() => {
                    setPasswordModalVisible(false);
                    setShopToDelete(null);
                }}
                onConfirm={handleConfirmDelete}
                shopName={shopToDelete?.shopName || ''}
            />
        </Container>
    )
}

const Container = styled(SafeAreaView)`
    flex: 1;
    background-color: #F5F7FA; 
`;

const ContainerHeader = styled.View`
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    background-color: white; 
    padding: 12px 0;
`;
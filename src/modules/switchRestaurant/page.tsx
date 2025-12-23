import env from "@/constant/envConstant";
import { UIButtonBack } from "@/core/ui";
import { useGetListShopUserQuery } from "@/lib/services/modules";
import storage from "@/lib/services/store/cookieStorage";
import { ROUTE } from "@/routers";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { FlatList, StatusBar, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ChooseShopItem from "./components/chooseShopItem";
import PasswordConfirmModal from "./components/PasswordConfirmModal";
import ShopModal from "./components/ShopModal";
import { IShopData } from "./switchRestaurant.type";

export default function SwitchRestaurantPage() {
    const [editShop, setEditShop] = useState<IShopData | undefined>(undefined);
    const [passwordModalVisible, setPasswordModalVisible] = useState(false);
    const [shopToDelete, setShopToDelete] = useState<IShopData | null>(null);
    const [modalVisible, setModalVisible] = useState(false);
    const { data } = useGetListShopUserQuery(null)
    const router = useRouter()

    const handleGotoShop = async (id: number) => {
        await storage.setItem(env.SHOP_ID, id.toString())
        router.replace(ROUTE.TABLE_AREA);
    };


    const handleSubmit = (data: IShopData) => {
        // const formData = createImageFormData(data);
        // Dispatch logic here
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
            // Delete logic here
            setPasswordModalVisible(false);
            setShopToDelete(null);
        } catch (error) {
            console.error('Error deleting shop:', error);
        }
    };


    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#F5F7FA" />
            <SafeAreaView style={{ flex: 1 }}>

                {/* Header Section */}
                <View style={styles.header}>
                    <View style={styles.headerTopRow}>
                        <UIButtonBack />
                        {/* Add Button */}
                        <TouchableOpacity
                            style={styles.addButton}
                            onPress={() => {
                                setEditShop(undefined);
                                setModalVisible(true);
                            }}
                        >
                            <MaterialIcons name="add" size={24} color="#fff" />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.welcomeSection}>
                        <Text style={styles.welcomeTitle}>Chào mừng trở lại!</Text>
                        <Text style={styles.welcomeSubtitle}>Chọn nhà hàng để bắt đầu làm việc</Text>
                    </View>
                </View>

                {/* List Section */}
                <FlatList
                    data={data?.data || []}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={({ item }) => (
                        <ChooseShopItem
                            propsItem={item}
                            onPressIdShop={handleGotoShop}
                            onPressEdit={handleEdit}
                            onPressDelete={handleDelete}
                        />
                    )}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={
                        <View style={styles.emptyState}>
                            <MaterialIcons name="storefront" size={64} color="#D1D5DB" />
                            <Text style={styles.emptyText}>Chưa có nhà hàng nào</Text>
                            <TouchableOpacity onPress={() => setModalVisible(true)}>
                                <Text style={styles.createLink}>Tạo nhà hàng mới</Text>
                            </TouchableOpacity>
                        </View>
                    }
                />

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
            </SafeAreaView>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F7FA',
    },
    header: {
        paddingHorizontal: 20,
        paddingTop: 10,
        paddingBottom: 24,
    },
    headerTopRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    addButton: {
        backgroundColor: '#F97316', // Brand Orange
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: "#F97316",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    welcomeSection: {
        gap: 8,
    },
    welcomeTitle: {
        fontSize: 28,
        fontWeight: '800', // Extra bold
        color: '#111827',
        letterSpacing: -0.5,
    },
    welcomeSubtitle: {
        fontSize: 16,
        color: '#6B7280',
        lineHeight: 24,
    },
    listContent: {
        paddingBottom: 40,
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 60,
        gap: 16,
    },
    emptyText: {
        fontSize: 16,
        color: '#9CA3AF',
    },
    createLink: {
        fontSize: 16,
        color: '#F97316',
        fontWeight: '600',
    }
});
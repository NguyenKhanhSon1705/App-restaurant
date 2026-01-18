import { images } from "@/assets/images";
import { LoadingRotate } from "@/common/components";
import { formatCurrencyVN } from "@/common/utils";
import { UIButtonBack } from "@/core/ui";
import { useAbortTableDishMutation, useCreateTableDishMutation, useGetTableDishDataQuery, useUpdateTableDishMutation } from "@/lib/services/modules/tableDish";
import { IDish, ITableDishData } from "@/lib/services/modules/tableDish/type";
import { useTableDishWebSocket } from "@/modules/tableArea/hooks";
import { ROUTE } from "@/routers";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
    Dimensions,
    Image,
    Modal,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";
import { Button, Surface } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { SwipeListView } from "react-native-swipe-list-view";
import Toast from "react-native-toast-message";
import Checkout from "./components/checkout";
import Dishmodal from "./components/dishmodal";
import SwitchTableModal from "./components/switchTableModal";
import TotalTableInfoSlice from "./components/totalTableInfoSlice";

const { width } = Dimensions.get("window");

export default function TableDishPage() {
    const [foods, setFoods] = useState<IDish[] | []>([]);
    const [modalDishVisible, setModalDishVisible] = useState(false);
    const [modalSwitchTableVisible, setModalSwitchTableVisible] = useState(false);
    const [modalCheckoutVisible, setModalCheckoutVisible] = useState(false);
    const [modalTotalTableInfoSlice, setModalTotalTableInfoSlice] = useState(false);
    const { tableName, tableId } = useLocalSearchParams();
    const [abortModalVisible, setAbortModalVisible] = useState(false);
    const [abortReason, setAbortReason] = useState("");
    const [confirmModalVisible, setConfirmModalVisible] = useState(false);
    const [confirmModalConfig, setConfirmModalConfig] = useState<{
        title: string;
        message: string;
        onConfirm: () => void;
        confirmText?: string;
        cancelText?: string;
        isDanger?: boolean;
    }>({ title: "", message: "", onConfirm: () => { } });
    const router = useRouter();
    const [updateTableDish] = useUpdateTableDishMutation();
    const [createTableDish] = useCreateTableDishMutation();
    const [abortTableDish] = useAbortTableDishMutation();
    const { data, refetch, isLoading, isFetching } = useGetTableDishDataQuery(Number(tableId), {
        skip: !tableId,
    });

    // Listen for real-time dish updates via WebSocket
    useTableDishWebSocket({
        tableId: Number(tableId),
        enabled: !!tableId,
        onDishesUpdated: (dishes) => {
            console.log('[TableDish] Received dish update from WebSocket');
            setFoods(dishes as IDish[]);
            Toast.show({
                type: 'info',
                text1: 'Cập nhật',
                text2: 'Danh sách món ăn đã được cập nhật',
                position: 'top',
                visibilityTime: 2000
            });
        }
    });

    useEffect(() => {
        if (data?.data?.dish) {
            setFoods(data.data.dish);
        } else if (!isLoading && !isFetching && data?.data) {
            setFoods([]);
        }
    }, [data?.data?.dish, isLoading, isFetching]);


    const handleDelete = (rowKey: string) => {
        setConfirmModalConfig({
            title: "Xóa món ăn",
            message: "Bạn có chắc chắn muốn xóa món ăn này?",
            confirmText: "Xóa",
            cancelText: "Hủy",
            isDanger: true,
            onConfirm: () => {
                setFoods((prev: IDish[] | undefined) =>
                    prev ? prev.filter((item) => item.id !== Number(rowKey)) : []
                );
                setConfirmModalVisible(false);
            },
        });
        setConfirmModalVisible(true);
    };

    const handleQuantityChange = (id: number, newQuantity: number) => {
        setFoods((prevFoods) =>
            prevFoods?.map((food) =>
                food.id === id ? { ...food, quantity: newQuantity } : food
            )
        );
    };

    const handleAdddish = () => {
        setModalDishVisible(true);
    };

    const handleUpdate = () => {
        setConfirmModalConfig({
            title: "Xác nhận",
            message: "Bạn có muốn cập nhật bàn này không?",
            confirmText: "Có",
            cancelText: "Không",
            onConfirm: async () => {
                setConfirmModalVisible(false);
                try {
                    const res = await updateTableDish({
                        tableId: Number(tableId),
                        listDishId: foods.map((food) => ({
                            key: food.id,
                            selling_Price: food.selling_Price,
                            quantity: food.quantity,
                            notes: "TODO",
                        })),
                    }).unwrap();
                    if (res.isSuccess) {
                        Toast.show({ type: "success", text1: "Thành công", text2: "Cập nhật thành công" });
                    }
                } catch (err) {
                    console.log("err", err);
                    Toast.show({ type: "error", text1: "Thất bại", text2: "Cập nhật thất bại" });
                }
            },
        });
        setConfirmModalVisible(true);
    };

    const handleCreate = () => {
        setConfirmModalConfig({
            title: "Xác nhận",
            message: "Bạn có muốn thêm bàn này không?",
            confirmText: "Có",
            cancelText: "Không",
            onConfirm: async () => {
                setConfirmModalVisible(false);
                try {
                    const res = await createTableDish({
                        tableId: Number(tableId),
                        listDishId: foods.map((food) => ({
                            key: food.id,
                            selling_Price: food.selling_Price,
                            quantity: food.quantity,
                            notes: "food.notes",
                        })),
                    }).unwrap();

                    if (res.isSuccess) {
                        Toast.show({ type: "success", text1: "Thành công", text2: "Tạo bàn thành công" });
                        // refetch(); // Handled by tags
                    }
                } catch (err) {
                    console.log("err", err);
                    Toast.show({ type: "error", text1: "Thất bại", text2: "Tạo bàn thất bại" });
                }
            },
        });
        setConfirmModalVisible(true);
    };

    const handleChangeTable = () => {
        setModalSwitchTableVisible(true);
    };

    const handleAbortTable = () => {
        setAbortModalVisible(true);
    };

    const handlePayment = () => {
        setModalCheckoutVisible(true);
    };

    const handleConfirmAbort = async () => {
        setAbortModalVisible(false);
        try {
            const res = await abortTableDish({
                table_Id: Number(tableId),
                reason_abort: abortReason,
                total_money: foods.reduce((total, food) => total + food.selling_Price * food.quantity, 0),
                total_quantity: foods.reduce((total, food) => total + food.quantity, 0),
            }).unwrap();

            if (res.isSuccess) {
                Toast.show({ type: "success", text1: "Thành công", text2: "Hủy bàn thành công" });
                router.replace(ROUTE.TABLE_AREA);
            }
        } catch (err) {
            console.log("err", err);
            Toast.show({ type: "error", text1: "Thất bại", text2: err instanceof Error ? err.message : "Hủy bàn thất bại" });
        }
    };

    const handleSwitchSuccess = () => {
        // Trigger manual refetch to get data for the NEW tableId
        // refetch(); // Handled by tags
    };

    // Helper to calculate total
    const totalAmount = foods.reduce((total, food) => total + food.selling_Price * food.quantity, 0);

    return (
        <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
            <Modal
                visible={abortModalVisible}
                transparent
                animationType="fade"
                onRequestClose={() => setAbortModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.abortModalContent}>
                        <Text style={styles.modalTitle}>Nhập lý do hủy bàn</Text>
                        <TextInput
                            placeholder="Nhập lý do..."
                            value={abortReason}
                            onChangeText={setAbortReason}
                            style={styles.textInput}
                            multiline
                        />
                        <View style={styles.modalActions}>
                            <Button mode="text" onPress={() => setAbortModalVisible(false)} textColor="#6B7280">Đóng</Button>
                            <Button mode="contained" onPress={handleConfirmAbort} disabled={!abortReason.trim()} buttonColor="#EF4444">Xác nhận</Button>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Confirmation Modal */}
            <Modal
                visible={confirmModalVisible}
                transparent
                animationType="fade"
                onRequestClose={() => setConfirmModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.confirmModalContent}>
                        <Text style={styles.modalTitle}>{confirmModalConfig.title}</Text>
                        <Text style={styles.modalMessage}>{confirmModalConfig.message}</Text>
                        <View style={styles.modalActions}>
                            <Button
                                mode="text"
                                onPress={() => setConfirmModalVisible(false)}
                                textColor="#6B7280"
                            >
                                {confirmModalConfig.cancelText || "Hủy"}
                            </Button>
                            <Button
                                mode="contained"
                                onPress={confirmModalConfig.onConfirm}
                                buttonColor={confirmModalConfig.isDanger ? "#EF4444" : "#22C55E"}
                            >
                                {confirmModalConfig.confirmText || "Xác nhận"}
                            </Button>
                        </View>
                    </View>
                </View>
            </Modal>

            {isLoading && <LoadingRotate />}

            {/* Header */}
            <View style={styles.header}>
                <UIButtonBack />
                <View style={styles.headerInfo}>
                    <Text style={styles.headerTitle}>{tableName}</Text>
                    <Text style={styles.headerSubtitle}>{data?.data?.areaName}</Text>
                </View>
                <TouchableOpacity
                    style={styles.menuButton}
                    onPress={() => setModalTotalTableInfoSlice(true)}
                >
                    <Ionicons name="ellipsis-horizontal" size={24} color="#374151" />
                </TouchableOpacity>
            </View>

            {/* Add Dish Bar */}
            <TouchableOpacity style={styles.addDishBar} onPress={handleAdddish}>
                <View style={styles.addDishIcon}>
                    <Ionicons name="add" size={24} color="#fff" />
                </View>
                <Text style={styles.addDishText}>Thêm món mới</Text>
            </TouchableOpacity>


            {/* List */}
            <SwipeListView
                data={foods}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={styles.listContent}
                renderItem={({ item }) => (
                    <View style={styles.foodCard}>
                        <Image
                            source={item.image ? { uri: item.image } : images.avt_default}
                            style={styles.foodImage}
                        />
                        <View style={styles.foodInfo}>
                            <Text style={styles.foodName} numberOfLines={2} ellipsizeMode="tail">{item.dish_Name}</Text>
                            <Text style={styles.foodPrice}>{formatCurrencyVN(item.selling_Price)} đ</Text>
                        </View>
                        <View style={styles.quantityContainer}>
                            <TouchableOpacity
                                style={styles.qtyBtn}
                                onPress={() => handleQuantityChange(item.id, Math.max(item.quantity - 1, 1))}
                            >
                                <Ionicons name="remove" size={16} color="#374151" />
                            </TouchableOpacity>
                            <Text style={styles.qtyText}>{item.quantity}</Text>
                            <TouchableOpacity
                                style={styles.qtyBtn}
                                onPress={() => handleQuantityChange(item.id, item.quantity + 1)}
                            >
                                <Ionicons name="add" size={16} color="#374151" />
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
                renderHiddenItem={({ item }) => (
                    <View style={styles.rowBack}>
                        <TouchableOpacity
                            style={[styles.backBtn, styles.backBtnRight]}
                            onPress={() => handleDelete(item.id.toString())}
                        >
                            <Ionicons name="trash-outline" size={24} color="#FFF" />
                        </TouchableOpacity>
                    </View>
                )}
                rightOpenValue={-75}
                disableRightSwipe
                previewRowKey={"0"}
                previewOpenValue={-40}
                previewOpenDelay={3000}
            />

            {/* Bottom Actions */}
            <Surface style={styles.bottomBar} elevation={4}>
                <View style={styles.totalSection}>
                    <Text style={styles.totalLabel}>Tổng tiền:</Text>
                    <Text style={styles.totalValue}>{formatCurrencyVN(totalAmount)} đ</Text>
                </View>

                {data?.data?.isActive ? (
                    <View style={styles.gridActions}>
                        <Button
                            mode="contained"
                            style={[styles.gridBtn, { backgroundColor: '#22C55E' }]} // Green
                            icon="check"
                            textColor="#fff"
                            onPress={handleUpdate}
                        >
                            Cập nhật
                        </Button>
                        <Button
                            mode="contained"
                            style={[styles.gridBtn, { backgroundColor: '#F97316' }]} // Orange
                            icon="autorenew"
                            textColor="#fff"
                            onPress={handleChangeTable}
                        >
                            Chuyển bàn
                        </Button>
                        <Button
                            mode="contained"
                            style={[styles.gridBtn, { backgroundColor: '#3B82F6' }]} // Blue
                            icon="credit-card-outline"
                            textColor="#fff"
                            // @ts-ignore
                            onPress={handlePayment}
                        >
                            Thanh toán
                        </Button>
                        <Button
                            mode="contained"
                            style={[styles.gridBtn, { backgroundColor: '#EF4444' }]} // Red
                            icon="close"
                            textColor="#fff"
                            onPress={handleAbortTable}
                        >
                            Hủy bàn
                        </Button>
                    </View>
                ) : (
                    <Button
                        mode="contained"
                        style={styles.fullWidthBtn}
                        buttonColor="#22C55E"
                        contentStyle={{ height: 48 }}
                        onPress={handleCreate}
                    >
                        Tạo bàn mới
                    </Button>
                )}
            </Surface>


            {data?.data && <TotalTableInfoSlice
                table={data?.data as ITableDishData}
                visible={modalTotalTableInfoSlice}
                onClose={() => setModalTotalTableInfoSlice(false)}
            />}

            <Dishmodal
                visible={modalDishVisible}
                onClose={() => setModalDishVisible(false)}
                onItemPress={(items?: IDish[]) => {
                    const newItems = items ?? [];
                    setFoods(prevFoods => {
                        const updatedFoods = [...prevFoods];
                        for (const newItem of newItems) {
                            const index = updatedFoods.findIndex(food => food.id === newItem.id);
                            if (index !== -1) {
                                updatedFoods[index] = { ...updatedFoods[index], quantity: updatedFoods[index].quantity + 1 };
                            } else {
                                updatedFoods.push({ ...newItem, quantity: 1 });
                            }
                        }
                        return updatedFoods;
                    });
                }}
            />
            <SwitchTableModal
                visible={modalSwitchTableVisible}
                onClose={() => setModalSwitchTableVisible(false)}
                currentTableId={Number(tableId)}
                onSwitchSuccess={handleSwitchSuccess}
            />
            <Checkout
                visible={modalCheckoutVisible}
                onClose={() => setModalCheckoutVisible(false)}
                tableId={Number(tableId)}
                tableName={String(tableName)}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F9FAFB",
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        paddingBottom: 10,
        backgroundColor: "#F9FAFB",
    },
    headerInfo: {
        flex: 1,
        alignItems: "center",
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: "700",
        color: "#111827",
    },
    headerSubtitle: {
        fontSize: 14,
        color: "#6B7280",
    },
    menuButton: {
        padding: 8,
        backgroundColor: "#F3F4F6",
        borderRadius: 20,
    },
    addDishBar: {
        flexDirection: "row",
        alignItems: "center",
        marginHorizontal: 16,
        marginBottom: 10,
        backgroundColor: "#fff",
        padding: 10,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#E5E7EB",
    },
    addDishIcon: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: "#10B981",
        alignItems: "center",
        justifyContent: "center",
        marginRight: 10,
    },
    addDishText: {
        fontSize: 16,
        fontWeight: "600",
        color: "#374151",
    },
    listContent: {
        paddingBottom: 220, // Increased space for larger bottom bar
        paddingHorizontal: 16,
    },
    foodCard: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#fff",
        borderRadius: 12,
        padding: 10,
        marginBottom: 10,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    foodImage: {
        width: 60,
        height: 60,
        borderRadius: 8,
        backgroundColor: "#F3F4F6",
    },
    foodInfo: {
        flex: 1,
        marginLeft: 12,
        justifyContent: "center",
    },
    foodName: {
        fontSize: 16,
        fontWeight: "600",
        color: "#1F2937",
        marginBottom: 4,
    },
    foodPrice: {
        fontSize: 14,
        color: "#DC2626",
        fontWeight: "700",
    },
    quantityContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#F3F4F6",
        borderRadius: 20,
        paddingHorizontal: 8,
        paddingVertical: 4,
        height: 36,
    },
    qtyBtn: {
        width: 28,
        height: 28,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#fff",
        borderRadius: 14,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 1,
        elevation: 1,
    },
    qtyText: {
        fontSize: 14,
        fontWeight: "700",
        color: "#1F2937",
        minWidth: 24,
        textAlign: 'center',
        marginHorizontal: 8,
    },
    rowBack: {
        alignItems: 'center',
        backgroundColor: '#F9FAFB',
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginBottom: 10,
        paddingRight: 16,
    },
    backBtn: {
        alignItems: 'center',
        bottom: 10, // Match the foodCard marginBottom to prevent bleeding
        justifyContent: 'center',
        position: 'absolute',
        top: 0,
        width: 75,
        borderRadius: 12,
    },
    backBtnRight: {
        backgroundColor: '#EF4444',
        right: 0,
    },
    bottomBar: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: "#fff",
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 16,
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    totalSection: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    totalLabel: {
        fontSize: 16,
        color: "#6B7280",
    },
    totalValue: {
        fontSize: 20,
        fontWeight: "700",
        color: "#DC2626",
    },
    gridActions: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
        justifyContent: 'space-between',
    },
    gridBtn: {
        width: '48%', // Approx 2 columns
        borderRadius: 8,
    },
    fullWidthBtn: {
        width: '100%',
        borderRadius: 8,
    },
    // Modal
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.5)",
        justifyContent: "center",
        alignItems: "center"
    },
    abortModalContent: {
        backgroundColor: "#fff",
        padding: 20,
        borderRadius: 16,
        width: "85%",
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 12,
        color: "#1F2937"
    },
    textInput: {
        borderWidth: 1,
        borderColor: "#E5E7EB",
        borderRadius: 8,
        padding: 12,
        minHeight: 80,
        marginBottom: 16,
        textAlignVertical: 'top'
    },
    modalActions: {
        flexDirection: "row",
        justifyContent: "flex-end",
        gap: 8
    },
    confirmModalContent: {
        backgroundColor: "#fff",
        padding: 24,
        borderRadius: 16,
        width: "85%",
        maxWidth: 400,
    },
    modalMessage: {
        fontSize: 16,
        color: "#6B7280",
        marginBottom: 24,
        lineHeight: 24,
    }
});
import { images } from "@/assets/images";
import { getIdShopFromStorage } from "@/common/utils";
import { useCreateAreaMutation, useDeleteAreaMutation, useGetAreaDataQuery, useUpdateAreaMutation } from "@/lib/services/modules/area";
import { IAreaData } from "@/lib/services/modules/area/type";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { Alert, Dimensions, FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AreaOptionsModal from "./components/areaOptionModal";
import AreaModal from "./components/editAreaModal";

const { width } = Dimensions.get("window");
const COLUMN_count = 2;
const GAP = 16;
const ITEM_WIDTH = (width - 40 - GAP) / COLUMN_count; // 40 is paddingHorizontal * 2

export default function AreaPage() {
    const [selectedArea, setSelectedArea] = useState<IAreaData | null>(null);
    const [isOptionsModalVisible, setIsOptionsModalVisible] = useState(false);
    const [isAreaModalVisible, setIsAreaModalVisible] = useState(false);
    const [modalPosition, setModalPosition] = useState({ top: 0, left: 0 });
    const { data, refetch } = useGetAreaDataQuery();
    const [updateArea] = useUpdateAreaMutation();
    const [createArea] = useCreateAreaMutation();
    const [deleteArea] = useDeleteAreaMutation()

    useFocusEffect(
        useCallback(() => {
            refetch()
        }, [refetch])
    );

    const openOptionsModal = (area: IAreaData, event: any) => {
        const { pageX, pageY } = event.nativeEvent;
        setSelectedArea(area);
        setModalPosition({ top: pageY, left: pageX });
        setIsOptionsModalVisible(true);
    };

    const closeOptionsModal = () => {
        setIsOptionsModalVisible(false);
    };

    const handleEdit = () => {
        if (selectedArea) {
            closeOptionsModal();
            setIsAreaModalVisible(true);
        }
    };

    const handleDelete = () => {
        if (selectedArea) {
            Alert.alert(
                "Xóa khu vực",
                `Bạn có chắc chắn muốn xóa ${selectedArea.areaName}?`,
                [
                    { text: "Hủy", style: "cancel" },
                    {
                        text: "Xóa",
                        onPress: async () => {
                            const res = await deleteArea(selectedArea.id)
                            if (res) {
                                refetch()
                            }
                        },
                        style: "destructive",
                    },
                ]
            );
        }
        closeOptionsModal();
    };


    const handleAddNew = () => {
        setSelectedArea(null);
        setIsAreaModalVisible(true);
    };

    const handleSaveArea = async (areaName: string, areaId?: number) => {
        if (areaId) {
            const idShop = Number(await getIdShopFromStorage());
            const res = await updateArea({ areaName: areaName, id: areaId, idShop: idShop })
            if (res) {
                refetch()
            }
        } else {
            const idShop = Number(await getIdShopFromStorage());
            const res = await createArea({ areaName: areaName, id: areaId, idShop: idShop })
            if (res) {
                refetch()
            }
        }
        closeAreaModal();
    };

    const closeAreaModal = () => {
        setIsAreaModalVisible(false);
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.headerContainer}>
                <View>
                    <Text style={styles.headerTitle}>Khu vực</Text>
                    <Text style={styles.headerSubtitle}>Quản lý danh sách bàn</Text>
                </View>
                <TouchableOpacity style={styles.addButton} onPress={handleAddNew}>
                    <Ionicons name="add" size={24} color="#fff" />
                    <Text style={styles.addButtonText}>Thêm</Text>
                </TouchableOpacity>
            </View>

            <FlatList
                data={data?.data}
                numColumns={COLUMN_count}
                keyExtractor={(item: { id: any; }): any => item.id}
                columnWrapperStyle={styles.row}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                renderItem={({ item }) => (
                    <View style={styles.areaCard}>
                        <View style={styles.imageContainer}>
                            <Image
                                source={images.avt_default}
                                style={styles.areaImage}
                            />
                            <View style={styles.badgeContainer}>
                                <Text style={styles.badgeText}>Hoạt động</Text>
                            </View>
                        </View>

                        <View style={styles.areaDetails}>
                            <Text style={styles.areaName} numberOfLines={1}>{item.areaName}</Text>
                            <TouchableOpacity
                                style={styles.optionsButton}
                                onPress={(event) => openOptionsModal(item, event)}
                                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                            >
                                <Ionicons name="ellipsis-vertical" size={20} color="#6B7280" />
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
                ListEmptyComponent={() => (
                    <View style={styles.emptyContainer}>
                        <Ionicons name="grid-outline" size={64} color="#E5E7EB" />
                        <Text style={styles.emptyText}>Chưa có khu vực nào</Text>
                        <Text style={styles.emptySubText}>Nhấn nút "Thêm" để tạo khu vực mới</Text>
                    </View>
                )}
            />

            <AreaOptionsModal
                visible={isOptionsModalVisible}
                onClose={closeOptionsModal}
                onEdit={handleEdit}
                onDelete={handleDelete}
                position={modalPosition}
            />

            <AreaModal
                visible={isAreaModalVisible}
                onClose={closeAreaModal}
                onSave={handleSaveArea}
                area={selectedArea}
            />
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F3F4F6", // Lighter grey background
    },
    headerContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 20,
        paddingVertical: 16,
        backgroundColor: "#fff",
        borderBottomWidth: 1,
        borderBottomColor: "#F3F4F6",
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: "700",
        color: "#111827",
    },
    headerSubtitle: {
        fontSize: 14,
        color: "#6B7280",
        marginTop: 2,
    },
    addButton: {
        flexDirection: "row",
        backgroundColor: "#ff8c47",
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 24, // Pill shape
        alignItems: "center",
        shadowColor: "#ff8c47",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
        elevation: 6,
    },
    addButtonText: {
        color: "#fff",
        fontSize: 14,
        fontWeight: "600",
        marginLeft: 4,
    },
    listContent: {
        padding: 20,
        paddingBottom: 40,
    },
    row: {
        justifyContent: "space-between",
        marginBottom: 16,
    },
    areaCard: {
        width: ITEM_WIDTH,
        backgroundColor: "#ffffff",
        borderRadius: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 10,
        elevation: 4,
        overflow: "visible", // Changed for shadow visibility on iOS
    },
    imageContainer: {
        height: 120,
        width: "100%",
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        overflow: "hidden",
        position: 'relative',
    },
    areaImage: {
        width: "100%",
        height: "100%",
        resizeMode: "cover",
    },
    badgeContainer: {
        position: 'absolute',
        top: 8,
        left: 8,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    badgeText: {
        fontSize: 10,
        fontWeight: '600',
        color: '#059669', // Green for active status
    },
    areaDetails: {
        padding: 12,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        borderBottomLeftRadius: 16,
        borderBottomRightRadius: 16,
    },
    areaName: {
        fontSize: 16,
        fontWeight: "600",
        color: "#1F2937",
        flexShrink: 1, // Prevent text overflow
    },
    optionsButton: {
        padding: 8,
        borderRadius: 20,
        backgroundColor: "#F9FAFB",
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 60,
    },
    emptyText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#374151',
        marginTop: 16,
    },
    emptySubText: {
        fontSize: 14,
        color: '#9CA3AF',
        marginTop: 8,
    },
});

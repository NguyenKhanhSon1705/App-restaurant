import { useCreateTableMutation, useDeleteTableMutation, useGetTableDataQuery, useUpdateTableMutation } from "@/lib/services/modules/table";
import { ITableData } from "@/lib/services/modules/table/type";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { Alert, Dimensions, FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import TableModal from "./components/editTableModal";
import TableOptionsModal from "./components/tableOptionModal";

const { width } = Dimensions.get("window");
const COLUMN_COUNT = 2;
const GAP = 16;
const ITEM_WIDTH = (width - 40 - GAP) / COLUMN_COUNT; // 40 is paddingHorizontal * 2

export default function TablePage() {

    const [selectedTable, setSelectedTable] = useState<ITableData | null>(null);
    const [isOptionsModalVisible, setIsOptionsModalVisible] = useState(false);
    const [isTableModalVisible, setIsTableModalVisible] = useState(false);
    const [modalPosition, setModalPosition] = useState({ top: 0, left: 0 });
    const [highlightedTableId, setHighlightedTableId] = useState<number | null>(null);
    const { data, refetch } = useGetTableDataQuery()
    const [deleteTable] = useDeleteTableMutation()
    const [createTable] = useCreateTableMutation()
    const [updateTable] = useUpdateTableMutation()

    useFocusEffect(
        useCallback(() => {
            refetch()
        }, [refetch])
    );

    const openOptionsModal = (table: ITableData, event: any) => {
        const { pageX, pageY } = event.nativeEvent;
        setSelectedTable(table);
        setModalPosition({ top: pageY, left: pageX });
        setIsOptionsModalVisible(true);
    };

    const closeOptionsModal = () => {
        setIsOptionsModalVisible(false);
    };

    const handleEdit = () => {
        if (selectedTable) {
            closeOptionsModal();
            setIsTableModalVisible(true);
        }
    };

    const handleDelete = () => {
        if (selectedTable) {
            Alert.alert(
                "Xóa bàn",
                `Bạn có chắc chắn muốn xóa ${selectedTable.nameTable}?`,
                [
                    { text: "Hủy", style: "cancel" },
                    {
                        text: "Xóa",
                        onPress: async () => {
                            const res = await deleteTable(selectedTable.id)
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

    const handleSaveTable = async (tableId: number, areaId: number, nameTable: string) => {
        if (tableId) {
            const res = await updateTable({ id: tableId, areaId: areaId, nameTable: nameTable })
            if (res) {
                refetch()
            }
            setHighlightedTableId(tableId);
        } else {
            const res = await createTable({ areaId: areaId, nameTable: nameTable })
            if (res) {
                refetch()
            }
        }
        closeTableModal();
    };

    const handleAddNew = () => {
        setSelectedTable(null);
        setIsTableModalVisible(true);
    };

    const closeTableModal = () => {
        setIsTableModalVisible(false);
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.headerContainer}>
                <View>
                    <Text style={styles.headerTitle}>Danh sách bàn</Text>
                    <Text style={styles.headerSubtitle}>Quản lý chi tiết bàn ăn</Text>
                </View>
                <TouchableOpacity style={styles.addButton} onPress={handleAddNew}>
                    <Ionicons name="add" size={24} color="#fff" />
                    <Text style={styles.addButtonText}>Thêm</Text>
                </TouchableOpacity>
            </View>

            <FlatList
                data={data?.data}
                numColumns={COLUMN_COUNT}
                keyExtractor={(item) => item.id.toString()}
                columnWrapperStyle={styles.row}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                renderItem={({ item }) => (
                    <View style={styles.card}>
                        <View style={styles.iconContainer}>
                            <Ionicons name="restaurant-outline" size={40} color="#ff8c47" />
                        </View>

                        <View style={styles.cardDetails}>
                            <View style={styles.textContainer}>
                                <Text style={styles.areaNameLabel}>{item.areaName}</Text>
                                <Text style={styles.tableName} numberOfLines={1}>{item.nameTable}</Text>
                            </View>

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
                        <Ionicons name="file-tray-outline" size={64} color="#E5E7EB" />
                        <Text style={styles.emptyText}>Chưa có bàn nào</Text>
                        <Text style={styles.emptySubText}>Nhấn nút "Thêm" để tạo bàn mới</Text>
                    </View>
                )}
            />

            <TableOptionsModal
                visible={isOptionsModalVisible}
                onClose={closeOptionsModal}
                onEdit={handleEdit}
                onDelete={handleDelete}
                position={modalPosition}
            />

            <TableModal
                visible={isTableModalVisible}
                onClose={closeTableModal}
                onSave={handleSaveTable}
                table={selectedTable}
            />
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F3F4F6",
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
        borderRadius: 24,
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
    card: {
        width: ITEM_WIDTH,
        backgroundColor: "#ffffff",
        borderRadius: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 10,
        elevation: 4,
        overflow: "visible",
    },
    iconContainer: {
        height: 100,
        width: "100%",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#FFF7ED", // Light orange bg for icon
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
    },
    cardDetails: {
        padding: 12,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        borderBottomLeftRadius: 16,
        borderBottomRightRadius: 16,
    },
    textContainer: {
        flex: 1,
        marginRight: 8,
    },
    areaNameLabel: {
        fontSize: 12,
        color: "#9CA3AF",
        marginBottom: 2,
        fontWeight: "500",
        textTransform: "uppercase",
    },
    tableName: {
        fontSize: 16,
        fontWeight: "700",
        color: "#1F2937",
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
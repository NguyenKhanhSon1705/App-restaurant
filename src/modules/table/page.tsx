import { useCreateTableMutation, useDeleteTableMutation, useGetTableDataQuery, useUpdateTableMutation } from "@/lib/services/modules/table";
import { ITableData } from "@/lib/services/modules/table/type";
import { FontAwesome5 } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import TableModal from "./components/editTableModal";
import TableOptionsModal from "./components/tableOptionModal";

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
                "Xóa khu vực",
                `Bạn có chắc chắn muốn xóa ${selectedTable.nameTable}?`,
                [
                    { text: "Hủy", style: "cancel" },
                    {
                        text: "Xóa",
                        onPress: async () => {
                            const res = await deleteTable(selectedTable.id)
                            if(res) {
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
            const res = await updateTable({id:tableId, areaId: areaId, nameTable: nameTable})
            if(res) {
                refetch()
            }
            setHighlightedTableId(tableId);
        } else {
            const res = await createTable({ areaId: areaId, nameTable: nameTable})
            if(res) {
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
                <Text style={styles.sectionTitle}>Danh sách bàn</Text>
                <TouchableOpacity style={styles.addButton} onPress={handleAddNew}>
                    <Text style={styles.addButtonText}>Thêm mới</Text>
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.gridContainer}>
                {data?.data?.map((table: ITableData) => (
                    <View key={table.id} style={styles.areaCard}>
                        <FontAwesome5
                            name="table"
                            size={50}
                            color="#ff8c47"
                            style={styles.areaImage} />
                        <View style={styles.areaDetails}>
                            <View style={styles.areaTextContainer}>
                                <Text numberOfLines={1} ellipsizeMode="tail">
                                    <Text style={[styles.areaName, { color: "#999" }]}>{table.areaName} - </Text>
                                    <Text style={[styles.areaName, { color: "#ff8c47" }]}>{table.nameTable}</Text>
                                </Text>
                            </View>

                            <TouchableOpacity
                                style={styles.optionsButton}
                                onPress={(event) => openOptionsModal(table, event)}
                            >
                                <Text style={styles.optionsButtonText}>•••</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                ))}
            </ScrollView>

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
        paddingHorizontal: 15,

    },
    headerContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginVertical: 15,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#ff8c47",
    },
    addButton: {
        backgroundColor: "transparent",
        paddingVertical: 10,
        paddingHorizontal: 18,
        borderRadius: 4,
        borderWidth: 1,
        borderColor: "#ff8c47",
    },
    addButtonText: {
        color: "#ff8c47",
        fontSize: 14,
        fontWeight: "bold",
    },
    gridContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-between",
        paddingBottom: 50
    },
    areaCard: {
        width: "48%",
        backgroundColor: "white",
        borderRadius: 10,
        marginBottom: 15,
        elevation: 3,
    },

    areaImage: {

        resizeMode: "cover",
        alignSelf: "center",
        marginTop: 10,
    },
    areaDetails: {
        padding: 10,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    areaName: {
        fontSize: 14,
        fontWeight: "bold",
    },
    optionsButton: {
        padding: 5,
    },
    optionsButtonText: {
        fontSize: 16,
        color: "#ff8c47",
    },
    areaTextContainer: {
        flexDirection: "column",
    },
});
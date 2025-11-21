import { images } from "@/assets/images";
import { getIdShopFromStorage } from "@/common/utils";
import { useCreateAreaMutation, useDeleteAreaMutation, useGetAreaDataQuery, useUpdateAreaMutation } from "@/lib/services/modules/area";
import { IAreaData } from "@/lib/services/modules/area/type";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { Alert, FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AreaOptionsModal from "./components/areaOptionModal";
import AreaModal from "./components/editAreaModal";

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
                <Text style={styles.sectionTitle}>Danh sách khu vực</Text>
                <TouchableOpacity style={styles.addButton} onPress={handleAddNew}>
                    <Text style={styles.addButtonText}>Thêm mới</Text>
                </TouchableOpacity>
            </View>

            <FlatList
                data={data?.data}
                numColumns={2}
                keyExtractor={(item: { id: any; }): any => item.id}
                columnWrapperStyle={styles.row}
                showsVerticalScrollIndicator={true}
                renderItem={({ item }) => (
                    <View style={styles.areaCard}>
                        <Image
                            source={images.avt_default}
                            style={styles.areaImage}
                        />

                        <View style={styles.areaDetails}>
                            <Text style={styles.areaName}>{item.areaName}</Text>

                            <TouchableOpacity
                                style={styles.optionsButton}
                                onPress={(event) => openOptionsModal(item, event)}
                            >
                                <Text style={styles.optionsButtonText}>•••</Text>
                            </TouchableOpacity>
                        </View>
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
    row: {
        justifyContent: "space-between",
        marginBottom: 20,
    },

    container: {
        flex: 1,
        backgroundColor: "#F9FAFB",
        paddingHorizontal: 20,
        paddingTop: 10,
    },
    headerContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "600",
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
        fontWeight: "600",

    },
    gridContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-between",
    },
    areaCard: {
        width: "48%",
        backgroundColor: "#ffffff",
        borderRadius: 16,
        shadowColor: "#ff8c47",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    areaImage: {
        width: "100%",
        height: 130,
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        resizeMode: "cover",
    },
    areaDetails: {
        padding: 12,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    areaName: {
        fontSize: 16,
        fontWeight: "600",
        color: "#ff8c47",
        flexShrink: 1,
    },
    optionsButton: {
        padding: 6,
        backgroundColor: "#F3F4F6",
        borderRadius: 8,
    },
    optionsButtonText: {
        fontSize: 18,
        color: "#ff8c47",
    },
});

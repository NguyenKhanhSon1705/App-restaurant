import { LoadingRotate } from '@/common/components';
import { useGetTableAreaDataQuery } from '@/lib/services/modules';
import { useGetAreaDataQuery } from '@/lib/services/modules/area';
import { IAreaData } from '@/lib/services/modules/area/type';
import { useSwitchTableMutation } from '@/lib/services/modules/tableDish';
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
    Alert,
    Animated,
    Dimensions,
    Easing,
    FlatList,
    Pressable,
    StyleSheet,
    Text,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View
} from 'react-native';
import { Button, Surface } from 'react-native-paper';
import Toast from 'react-native-toast-message';

const screenHeight = Dimensions.get('window').height;
const screenWidth = Dimensions.get('window').width;
const modalHeight = screenHeight * 0.78;

const COLUMN_COUNT = 3;
const GAP = 12;
const PADDING = 16;
const ITEM_WIDTH = (screenWidth - (PADDING * 2) - (GAP * (COLUMN_COUNT - 1))) / COLUMN_COUNT;

type Props = {
    visible: boolean;
    onClose: () => void;
    onItemPress?: (item: any) => void;
    currentTableId?: number;
    onSwitchSuccess?: (newTableId: number, newTableName: string) => void;
};



const SwitchTableModal = ({ visible, onClose, onItemPress, currentTableId, onSwitchSuccess }: Props) => {
    const slideAnim = useRef(new Animated.Value(modalHeight)).current;

    // State for selected area and table
    const [selectedAreaId, setSelectedAreaId] = useState<number | null>(null);
    const [selectedTableId, setSelectedTableId] = useState<number | null>(null);

    const [isVisible, setIsVisible] = useState(false);
    const flatListRef = useRef<FlatList>(null);

    // Queries and Mutations
    const { data: areaData } = useGetAreaDataQuery();
    const { data: tableData, isFetching: isTableLoading } = useGetTableAreaDataQuery(selectedAreaId || undefined, {
        skip: !selectedAreaId
    });
    const [switchTable, { isLoading: isSwitching }] = useSwitchTableMutation();
    const router = useRouter();

    useEffect(() => {
        if (visible) {
            setIsVisible(true);
            setSelectedTableId(null); // Reset selection when opening

            // Default to first area if available and none selected
            if (!selectedAreaId && areaData?.data && areaData.data.length > 0) {
                setSelectedAreaId(areaData.data[0].id);
            }
            Animated.timing(slideAnim, {
                toValue: 40,
                duration: 300,
                easing: Easing.out(Easing.ease),
                useNativeDriver: true,
            }).start();
        } else {
            Animated.timing(slideAnim, {
                toValue: modalHeight,
                duration: 300,
                easing: Easing.in(Easing.ease),
                useNativeDriver: true,
            }).start(() => {
                setIsVisible(false);
                onClose();
            });
        }
    }, [visible, areaData]);

    const handleBackdropPress = useCallback(() => {
        Animated.timing(slideAnim, {
            toValue: modalHeight,
            duration: 300,
            easing: Easing.in(Easing.ease),
            useNativeDriver: true,
        }).start(() => {
            setIsVisible(false);
            onClose();
        });
    }, [onClose]);

    const handleAreaPress = (id: number, index: number) => {
        setSelectedAreaId(id);
        setSelectedTableId(null); // Reset selected table when area changes

        if (flatListRef.current) {
            flatListRef.current.scrollToIndex({
                index,
                animated: true,
                viewPosition: 0.5,
            });
        }
    };

    const handleTablePress = (tableId: number) => {
        if (tableId === currentTableId) return;
        setSelectedTableId(tableId);
    };

    const handleConfirmSwitch = () => {
        if (!selectedTableId || !currentTableId) return;

        Alert.alert(
            "Xác nhận chuyển bàn",
            "Bạn có chắc chắn muốn chuyển sang bàn này không?",
            [
                { text: "Hủy", style: "cancel" },
                {
                    text: "Chuyển",
                    onPress: async () => {
                        try {
                            const result = await switchTable({
                                table_id_old: currentTableId,
                                table_id_new: selectedTableId
                            }).unwrap();

                            if (result.isSuccess) {
                                Toast.show({
                                    type: "success",
                                    text1: "Thành công",
                                    text2: "Chuyển bàn thành công"
                                });

                                // Find selected table name for UI update
                                const targetTable = tableData?.data?.find(t => t.id === selectedTableId);
                                const newTableName = targetTable?.nameTable || "Bàn mới";

                                // Update current route params without reloading the entire app
                                router.setParams({
                                    tableId: selectedTableId.toString(),
                                    tableName: newTableName
                                });

                                if (onSwitchSuccess) {
                                    onSwitchSuccess(selectedTableId, newTableName);
                                }
                                onClose();
                            }
                        } catch (error) {
                            Toast.show({
                                type: "error",
                                text1: "Thất bại",
                                text2: "Chuyển bàn thất bại"
                            });
                        }
                    }
                }
            ]
        );
    };

    if (!isVisible) return null;

    return (
        <View style={styles.overlay}>
            {(isSwitching) && <LoadingRotate />}
            <TouchableWithoutFeedback onPress={handleBackdropPress}>
                <View style={styles.backdrop} />
            </TouchableWithoutFeedback>

            <Animated.View
                style={[
                    styles.modalContainer,
                    { height: modalHeight, transform: [{ translateY: slideAnim }] },
                ]}
            >
                <Surface style={styles.modalContent}>
                    <Text style={styles.headerTitle}>Chọn bàn chuyển đến</Text>

                    {/* Area List */}
                    <View style={{ height: 60, marginTop: 10 }}>
                        <FlatList
                            ref={flatListRef}
                            data={areaData?.data as IAreaData[]}
                            keyExtractor={(item) => `area-${item.id}`}
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={{ paddingHorizontal: 10 }}
                            renderItem={({ item, index }) => (
                                <TouchableOpacity
                                    style={[
                                        styles.areaCard,
                                        selectedAreaId === item.id && styles.selectedAreaCard,
                                    ]}
                                    onPress={() => handleAreaPress(item.id, index)}
                                >
                                    <Text style={[
                                        styles.areaTitle,
                                        selectedAreaId === item.id && styles.selectedAreaTitle
                                    ]}>
                                        {item.areaName}
                                    </Text>
                                </TouchableOpacity>
                            )}
                        />
                    </View>

                    {/* Table List */}
                    <View style={{ flex: 1, marginTop: 20 }}>
                        {isTableLoading ? (
                            <LoadingRotate />
                        ) : (
                            <FlatList
                                data={tableData?.data?.filter(t => t.id !== currentTableId)} // Show all tables EXCEPT the current one
                                keyExtractor={(item) => `table-${item.id}`}
                                numColumns={3}
                                renderItem={({ item }) => {
                                    const isAvailable = !item.isActive;
                                    const isSelected = selectedTableId === item.id;

                                    const handlePress = () => {
                                        if (!isAvailable) {
                                            Toast.show({
                                                type: "info",
                                                text1: "Thông báo",
                                                text2: "Bàn này đang có khách, không thể chuyển đến"
                                            });
                                            return;
                                        }
                                        handleTablePress(item.id);
                                    };

                                    return (
                                        <Pressable
                                            onPress={handlePress}
                                            style={({ pressed }: { pressed: boolean }) => [
                                                styles.tableCard,
                                                {
                                                    backgroundColor: isAvailable ? "#F0F9FF" : "#FEF2F2",
                                                    borderColor: isSelected ? "#4E71FF" : (isAvailable ? "#BAE6FD" : "#FECACA"),
                                                    borderWidth: isSelected ? 2 : 1,
                                                    transform: [{ scale: pressed ? 0.98 : 1 }],
                                                    margin: GAP / 2, // Adjust margin for grid
                                                }
                                            ]}
                                        >
                                            <View style={[
                                                styles.iconBadge,
                                                { backgroundColor: isAvailable ? "#E0F2FE" : "#FEE2E2" }
                                            ]}>
                                                <Ionicons
                                                    name={isAvailable ? "restaurant-outline" : "people-outline"}
                                                    size={24}
                                                    color={isAvailable ? "#0284C7" : "#DC2626"}
                                                />
                                            </View>

                                            <Text style={[
                                                styles.tableTitle,
                                                { color: isAvailable ? "#0369A1" : "#991B1B" }
                                            ]} numberOfLines={1}>
                                                {item.nameTable}
                                            </Text>

                                            <View style={[
                                                styles.statusDot,
                                                { backgroundColor: isAvailable ? "#22C55E" : "#EF4444" }
                                            ]} />

                                            {isSelected && (
                                                <View style={styles.selectionOverlay}>
                                                    <View style={styles.checkBadge}>
                                                        <Ionicons name="checkmark" size={12} color="#fff" />
                                                    </View>
                                                </View>
                                            )}
                                        </Pressable>
                                    );
                                }}
                            />
                        )}
                    </View>

                    {/* Footer Button */}
                    <View style={styles.footer}>
                        <Button
                            mode="contained"
                            onPress={handleConfirmSwitch}
                            disabled={!selectedTableId || isSwitching}
                            style={styles.confirmButton}
                        >
                            Xác nhận chuyển
                        </Button>
                    </View>
                </Surface>
            </Animated.View>
        </View>
    );
};

const styles = StyleSheet.create({
    overlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 999,
        justifyContent: 'flex-end',
    },
    backdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.4)',
    },
    modalContainer: {
        width: '100%',
        backgroundColor: '#fff',
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        overflow: 'hidden',
        zIndex: 2,
    },
    modalContent: {
        flex: 1,
        paddingTop: 20,
        backgroundColor: '#fff',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 10,
    },
    areaCard: {
        backgroundColor: '#f0f0f0',
        borderRadius: 20,
        paddingHorizontal: 20,
        paddingVertical: 8,
        marginRight: 10,
        justifyContent: 'center',
        alignItems: 'center',
        height: 40,
        borderWidth: 1,
        borderColor: 'transparent',
    },
    selectedAreaCard: {
        backgroundColor: '#dfe6fe',
        borderColor: '#4E71FF',
    },
    areaTitle: {
        fontSize: 14,
        color: '#666',
    },
    selectedAreaTitle: {
        color: '#4E71FF',
        fontWeight: 'bold',
    },
    // Synced Table Card Styles
    tableCard: {
        width: ITEM_WIDTH,
        height: ITEM_WIDTH * 1.1,
        borderRadius: 16,
        borderWidth: 1,
        alignItems: "center",
        justifyContent: "center",
        padding: 8,
        position: 'relative',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    selectedTableCard: {
        borderWidth: 2,
        borderColor: '#4E71FF',
        shadowOpacity: 0.1,
        elevation: 4,
    },
    iconBadge: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 8,
    },
    tableTitle: {
        fontSize: 14,
        fontWeight: "700",
        textAlign: "center",
    },
    statusDot: {
        position: 'absolute',
        top: 10,
        right: 10,
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    selectionOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(78, 113, 255, 0.05)',
        borderRadius: 16,
        borderWidth: 2,
        borderColor: '#4E71FF',
        pointerEvents: 'none',
    },
    checkBadge: {
        position: 'absolute',
        bottom: 6,
        right: 6,
        backgroundColor: '#4E71FF',
        borderRadius: 8,
        width: 16,
        height: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    emptyText: {
        textAlign: 'center',
        marginTop: 50,
        color: '#999',
    },
    footer: {
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: '#eee',
    },
    confirmButton: {
        backgroundColor: '#4E71FF',
        paddingVertical: 6,
    }
});

export default React.memo(SwitchTableModal);

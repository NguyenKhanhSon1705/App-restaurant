import { LoadingRotate } from '@/common/components';
import { useGetTableAreaDataQuery } from '@/lib/services/modules';
import { useGetAreaDataQuery } from '@/lib/services/modules/area';
import { IAreaData } from '@/lib/services/modules/area/type';
import { useSwitchTableMutation } from '@/lib/services/modules/tableDish';
import { ROUTE } from '@/routers';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
    Alert,
    Animated,
    Dimensions,
    Easing,
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View
} from 'react-native';
import { Button, Surface } from 'react-native-paper';
import Toast from 'react-native-toast-message';

const screenHeight = Dimensions.get('window').height;
const modalHeight = screenHeight * 0.78;

type Props = {
    visible: boolean;
    onClose: () => void;
    onItemPress?: (item: any) => void;
    currentTableId?: number;
};



const SwitchTableModal = ({ visible, onClose, onItemPress, currentTableId }: Props) => {
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
                                currentTableId: currentTableId,
                                targetTableId: selectedTableId
                            }).unwrap();

                            if (result.isSuccess) {
                                Toast.show({
                                    type: "success",
                                    text1: "Thành công",
                                    text2: "Chuyển bàn thành công"
                                });
                                onClose();
                                router.replace(ROUTE.TABLE_AREA);
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
                                data={tableData?.data?.filter(t => !t.isActive && t.id !== currentTableId)} // Only show empty tables
                                keyExtractor={(item) => `table-${item.id}`}
                                numColumns={3}
                                ListEmptyComponent={
                                    <Text style={styles.emptyText}>Không có bàn trống trong khu vực này</Text>
                                }
                                renderItem={({ item }) => (
                                    <TouchableOpacity
                                        style={[
                                            styles.tableCard,
                                            selectedTableId === item.id && styles.selectedTableCard
                                        ]}
                                        onPress={() => handleTablePress(item.id)}
                                    >
                                        <Text style={[
                                            styles.tableTitle,
                                            selectedTableId === item.id && styles.selectedTableTitle
                                        ]}>
                                            {item.nameTable}
                                        </Text>
                                    </TouchableOpacity>
                                )}
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
    tableCard: {
        flex: 1,
        margin: 5,
        height: 80,
        backgroundColor: '#f8f9fa',
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#eee',
        elevation: 2,
    },
    selectedTableCard: {
        borderColor: '#4E71FF',
        backgroundColor: '#f0f4ff',
        borderWidth: 2,
    },
    tableTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
    },
    selectedTableTitle: {
        color: '#4E71FF',
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

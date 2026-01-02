import { LoadingRotate } from "@/common/components";
import { formatCurrencyVN, getIdShopFromStorage } from "@/common/utils";
import { useCheckoutTableMutation, useGetInfoCheckoutQuery, useLazyCreatePaymentUrlQuery } from "@/lib/services/modules/tableDish";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import { Alert, Dimensions, FlatList, Modal, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Button, Surface } from "react-native-paper";
import Toast from "react-native-toast-message";
import { WebView, WebViewNavigation } from "react-native-webview";

const { height: screenHeight } = Dimensions.get("window");

type Props = {
    visible: boolean;
    onClose: () => void;
    tableId: number;
    tableName?: string;
};

const Checkout = ({ visible, onClose, tableId, tableName }: Props) => {
    const [shopId, setShopId] = useState<number | null>(null);
    const [paymentMethod, setPaymentMethod] = useState<'store' | 'vnpay'>('store');
    const [showWebView, setShowWebView] = useState(false);
    const [paymentUrl, setPaymentUrl] = useState<string | null>(null);

    const [createPaymentUrl, { isLoading: isCreatingUrl }] = useLazyCreatePaymentUrlQuery();

    useEffect(() => {
        const fetchShopId = async () => {
            const id = await getIdShopFromStorage();
            if (id) setShopId(+id);
        };
        if (visible) fetchShopId();
    }, [visible]);

    const { data: checkoutData, isLoading, isError } = useGetInfoCheckoutQuery(
        { table_id: tableId, shop_id: shopId! },
        { skip: !shopId || !visible }
    );
    const [checkout, { isLoading: isPaying }] = useCheckoutTableMutation();

    const handlePayment = () => {
        Alert.alert(
            "Xác nhận thanh toán",
            "Bạn có chắc chắn muốn hoàn tất đơn hàng này?",
            [
                { text: "Hủy", style: "cancel" },
                {
                    text: "Thanh toán",
                    onPress: async () => {
                        if (!shopId) return;

                        if (paymentMethod === 'vnpay') {
                            try {
                                const info = checkoutData?.data;
                                console.log("hahah", info?.total_money, shopId, tableId)
                                const res = await createPaymentUrl({
                                    shop_id: shopId,
                                    table_id: tableId,
                                    moneyToPay: info?.total_money || 0,
                                    description: `Thanh toán bàn ${tableName || info?.table_name} - ${new Date().toLocaleTimeString()}`
                                }).unwrap();

                                if (res) {
                                    setPaymentUrl(res);
                                    setShowWebView(true);
                                }
                            } catch (error) {
                                Toast.show({
                                    type: "error",
                                    text1: "Lỗi",
                                    text2: "Không thể tạo liên kết thanh toán"
                                });
                            }
                            return;
                        }

                        try {
                            const res = await checkout({
                                shop_id: shopId,
                                table_id: tableId,
                                payment_method: 0 // 0 for store/cash as per web
                            }).unwrap();

                            if (res.isSuccess) {
                                Toast.show({
                                    type: "success",
                                    text1: "Thành công",
                                    text2: "Thanh toán thành công"
                                });
                                onClose();
                            }
                        } catch (error) {
                            Toast.show({
                                type: "error",
                                text1: "Thất bại",
                                text2: "Thanh toán thất bại"
                            });
                        }
                    }
                }
            ]
        );
    };

    const handleWebViewNavigationStateChange = (newNavState: WebViewNavigation) => {
        const { url } = newNavState;
        if (!url) return;

        console.log("WebView URL:", url);

        // Check for success return URL
        if (url.includes('vnp_ResponseCode=00')) {
            setShowWebView(false);
            Toast.show({
                type: "success",
                text1: "Thành công",
                text2: "Thanh toán VNPay thành công"
            });
            onClose();
        } else if (url.includes('vnp_ResponseCode') && !url.includes('vnp_ResponseCode=00')) {
            setShowWebView(false);
            Toast.show({
                type: "error",
                text1: "Thất bại",
                text2: "Thanh toán VNPay thất bại hoặc bị hủy"
            });
            // Optional: keep modal open to retry or close it
            // setShowWebView(false); 
        }
    };

    if (!visible) return null;

    if (showWebView && paymentUrl) {
        return (
            <Modal
                visible={showWebView}
                onRequestClose={() => setShowWebView(false)}
                animationType="slide"
            >
                <SafeAreaView style={{ flex: 1 }}>
                    <View style={styles.header}>
                        <Text style={styles.headerTitle}>Thanh toán VNPay</Text>
                        <TouchableOpacity onPress={() => setShowWebView(false)} style={styles.closeButton}>
                            <Ionicons name="close" size={24} />
                        </TouchableOpacity>
                    </View>
                    <WebView
                        source={{ uri: paymentUrl }}
                        onNavigationStateChange={handleWebViewNavigationStateChange}
                        startInLoadingState
                        renderLoading={() => <LoadingRotate />}
                        style={{ flex: 1 }}
                    />
                </SafeAreaView>
            </Modal>
        )
    }

    const info = checkoutData?.data;

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContainer}>
                    {/* Header */}
                    <View style={styles.header}>
                        <Text style={styles.headerTitle}>Thanh toán - {tableName || info?.table_name}</Text>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <Ionicons name="close" size={24} color="#374151" />
                        </TouchableOpacity>
                    </View>

                    {/* Content */}
                    <View style={styles.content}>
                        {isLoading ? (
                            <LoadingRotate />
                        ) : isError ? (
                            <Text style={styles.errorText}>Có lỗi xảy ra khi tải thông tin.</Text>
                        ) : (
                            <>
                                {/* Receipt Header Info */}
                                <Surface style={styles.receiptHeader} elevation={1}>
                                    <Text style={styles.shopName}>{info?.shop_name}</Text>
                                    <Text style={styles.metaText}>
                                        <Ionicons name="location-outline" /> {info?.address_shop}
                                    </Text>

                                    <View style={styles.metaGrid}>
                                        <Text style={styles.metaItem}>Thu ngân: {info?.staff_name}</Text>
                                        <Text style={styles.metaItem}>Khu vực: {info?.area_name}</Text>
                                        <Text style={styles.metaItem}>Vào: {info?.time_start ? new Date(info.time_start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}</Text>
                                        <Text style={styles.metaItem}>Ra: {info?.time_end ? new Date(info.time_end).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Hiện tại'}</Text>
                                    </View>
                                </Surface>

                                {/* Dish List */}
                                <Text style={styles.sectionTitle}>Chi tiết đơn hàng</Text>
                                <FlatList
                                    data={info?.listDish}
                                    keyExtractor={(item) => item.dish_Name}
                                    style={styles.dishList}
                                    renderItem={({ item, index }) => (
                                        <View style={styles.dishRow}>
                                            <Text style={styles.index}>{index + 1}</Text>
                                            <View style={styles.dishInfo}>
                                                <Text style={styles.dishName}>{item.dish_Name}</Text>
                                                <Text style={styles.dishPrice}>{formatCurrencyVN(item.selling_Price)}</Text>
                                            </View>
                                            <Text style={styles.qty}>x{item.quantity}</Text>
                                            <Text style={styles.rowTotal}>{formatCurrencyVN(item.selling_Price * item.quantity)}</Text>
                                        </View>
                                    )}
                                />

                                {/* Total */}
                                <View style={styles.totalSection}>
                                    <Text style={styles.totalLabel}>Tổng thanh toán:</Text>
                                    <Text style={styles.totalValue}>{formatCurrencyVN(info?.total_money || 0)} đ</Text>
                                </View>

                                {/* Payment Method */}
                                <Text style={styles.sectionTitle}>Phương thức thanh toán</Text>
                                <View style={styles.paymentMethods}>
                                    <TouchableOpacity
                                        style={[styles.methodCard, paymentMethod === 'store' && styles.selectedMethod]}
                                        onPress={() => setPaymentMethod('store')}
                                    >
                                        <Ionicons name="wallet-outline" size={24} color={paymentMethod === 'store' ? "#3B82F6" : "#6B7280"} />
                                        <Text style={[styles.methodText, paymentMethod === 'store' && styles.selectedMethodText]}>Tiền mặt</Text>
                                        {paymentMethod === 'store' && <View style={styles.checkIcon}><Ionicons name="checkmark-circle" size={16} color="#3B82F6" /></View>}
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        style={[styles.methodCard, paymentMethod === 'vnpay' && styles.selectedMethod]}
                                        onPress={() => setPaymentMethod('vnpay')}
                                    >
                                        <Ionicons name="qr-code-outline" size={24} color={paymentMethod === 'vnpay' ? "#3B82F6" : "#6B7280"} />
                                        <Text style={[styles.methodText, paymentMethod === 'vnpay' && styles.selectedMethodText]}>VNPay</Text>
                                        {paymentMethod === 'vnpay' && <View style={styles.checkIcon}><Ionicons name="checkmark-circle" size={16} color="#3B82F6" /></View>}
                                    </TouchableOpacity>
                                </View>
                            </>
                        )}
                    </View>

                    {/* Footer Actions */}
                    <View style={styles.footer}>
                        <Button
                            mode="contained"
                            onPress={handlePayment}
                            loading={isPaying}
                            disabled={isLoading || isPaying || !checkoutData}
                            style={styles.payButton}
                        >
                            Thanh toán ngay
                        </Button>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.5)",
        justifyContent: "flex-end",
    },
    modalContainer: {
        backgroundColor: "#fff",
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        height: screenHeight * 0.9,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#E5E7EB",
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#1F2937",
    },
    closeButton: {
        padding: 4,
    },
    content: {
        flex: 1,
        padding: 16,
    },
    errorText: {
        textAlign: 'center',
        marginTop: 20,
        color: 'red'
    },
    receiptHeader: {
        padding: 16,
        backgroundColor: '#F9FAFB',
        borderRadius: 12,
        marginBottom: 20,
    },
    shopName: {
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 4,
        color: '#111827'
    },
    metaText: {
        fontSize: 12,
        color: '#6B7280',
        textAlign: 'center',
        marginBottom: 12
    },
    metaGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    metaItem: {
        width: '48%',
        fontSize: 12,
        color: '#374151',
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 10,
        color: '#1F2937'
    },
    dishList: {
        flex: 1,
        marginBottom: 20,
    },
    dishRow: {
        flexDirection: 'row',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
        alignItems: 'center'
    },
    index: {
        width: 30,
        color: '#6B7280',
        fontSize: 12
    },
    dishInfo: {
        flex: 1,
    },
    dishName: {
        fontSize: 14,
        fontWeight: '500',
        color: '#111827'
    },
    dishPrice: {
        fontSize: 12,
        color: '#6B7280'
    },
    qty: {
        width: 40,
        textAlign: 'center',
        fontWeight: '600',
        color: '#3B82F6',
        backgroundColor: '#EFF6FF',
        borderRadius: 4,
        overflow: 'hidden',
        paddingVertical: 2,
        fontSize: 12
    },
    rowTotal: {
        width: 80,
        textAlign: 'right',
        fontWeight: '600',
        color: '#111827'
    },
    totalSection: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        paddingVertical: 16,
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
        marginBottom: 20
    },
    totalLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: '#374151'
    },
    totalValue: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#EF4444'
    },
    paymentMethods: {
        flexDirection: 'row',
        gap: 12
    },
    methodCard: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        gap: 8,
        backgroundColor: '#fff'
    },
    selectedMethod: {
        borderColor: '#3B82F6',
        backgroundColor: '#EFF6FF'
    },
    methodText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#374151'
    },
    selectedMethodText: {
        color: '#3B82F6'
    },
    checkIcon: {
        marginLeft: 'auto'
    },
    footer: {
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
    },
    payButton: {
        backgroundColor: '#3B82F6',
        paddingVertical: 6
    }
});

export default Checkout;
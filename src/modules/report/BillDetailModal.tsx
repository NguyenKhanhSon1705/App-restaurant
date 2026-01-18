
import { useGetReportBillDetailQuery } from "@/lib/services/modules/report";
import { IReportBillDetailItem } from "@/lib/services/modules/report/type";
import { Feather } from "@expo/vector-icons";
import React from "react";
import { ActivityIndicator, Image, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface BillDetailModalProps {
    visible: boolean;
    billId: string | null;
    onClose: () => void;
}

const formatMoney = (amount: number) => {
    return amount.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
};

const BillDetailModal: React.FC<BillDetailModalProps> = ({ visible, billId, onClose }) => {
    const { data, isLoading, isError } = useGetReportBillDetailQuery(
        { id: billId || "" },
        { skip: !billId || !visible }
    );

    const detail = data?.data;

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Chi tiết hóa đơn</Text>
                        <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                            <Feather name="x" size={24} color="#64748B" />
                        </TouchableOpacity>
                    </View>

                    {isLoading ? (
                        <View style={styles.center}>
                            <ActivityIndicator size="large" color="#FF7043" />
                        </View>
                    ) : isError ? (
                        <View style={styles.center}>
                            <Text>Có lỗi xảy ra khi tải chi tiết.</Text>
                        </View>
                    ) : detail ? (
                        <ScrollView contentContainerStyle={styles.scrollContent}>
                            <View style={styles.section}>
                                <Text style={styles.sectionTitle}>Danh sách món ăn</Text>
                                {detail.list_item.map((item: IReportBillDetailItem, index: number) => (
                                    <View key={index} style={styles.itemRow}>
                                        <Image
                                            source={{ uri: item.image || "https://via.placeholder.com/60" }}
                                            style={styles.itemImage}
                                        />
                                        <View style={styles.itemInfo}>
                                            <Text style={styles.itemName}>{item.dish_name}</Text>
                                            <Text style={styles.itemNote}>{item.notes || "Không có ghi chú"}</Text>
                                            <View style={styles.itemFooter}>
                                                <Text style={styles.itemQuantity}>x{item.quantity}</Text>
                                                <Text style={styles.itemPrice}>{formatMoney(item.price)}</Text>
                                            </View>
                                        </View>
                                    </View>
                                ))}
                            </View>

                            <View style={styles.divider} />

                            <View style={styles.section}>
                                <Text style={styles.sectionTitle}>Thông tin thanh toán</Text>
                                <View style={styles.infoRow}>
                                    <Text style={styles.infoLabel}>Phương thức:</Text>
                                    <Text style={styles.infoValue}>{detail.payment_method}</Text>
                                </View>
                                <View style={styles.infoRow}>
                                    <Text style={styles.infoLabel}>Ngày thanh toán:</Text>
                                    <Text style={styles.infoValue}>{detail.payment_date || "N/A"}</Text>
                                </View>
                                <View style={styles.infoRow}>
                                    <Text style={styles.infoLabel}>Mô tả:</Text>
                                    <Text style={styles.infoValue}>{detail.description || "Không có"}</Text>
                                </View>
                            </View>
                        </ScrollView>
                    ) : null}
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
    modalContent: {
        backgroundColor: "#fff",
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        height: "80%", // Fixed height
    },
    modalHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: "#F1F5F9",
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: "700",
        color: "#1E293B",
    },
    closeBtn: {
        padding: 4,
    },
    center: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 40,
    },
    section: {
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: "700",
        color: "#334155",
        marginBottom: 12,
    },
    itemRow: {
        flexDirection: "row",
        marginBottom: 16,
        backgroundColor: "#F8FAFC",
        padding: 12,
        borderRadius: 12,
    },
    itemImage: {
        width: 60,
        height: 60,
        borderRadius: 8,
        marginRight: 12,
        backgroundColor: "#e2e8f0"
    },
    itemInfo: {
        flex: 1,
        justifyContent: "space-between",
    },
    itemName: {
        fontSize: 15,
        fontWeight: "600",
        color: "#1E293B",
    },
    itemNote: {
        fontSize: 12,
        color: "#64748B",
        fontStyle: "italic",
    },
    itemFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    itemQuantity: {
        fontSize: 14,
        fontWeight: '600',
        color: "#334155"
    },
    itemPrice: {
        fontSize: 14,
        fontWeight: "700",
        color: "#FF7043",
    },
    divider: {
        height: 1,
        backgroundColor: "#F1F5F9",
        marginVertical: 12,
    },
    infoRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 8,
    },
    infoLabel: {
        fontSize: 14,
        color: "#64748B",
    },
    infoValue: {
        fontSize: 14,
        fontWeight: "500",
        color: "#1E293B",
    },
});

export default BillDetailModal;

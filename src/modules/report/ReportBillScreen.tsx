import { UIButtonBack } from "@/core/ui";
import { UITextField } from "@/core/ui/UITextField";
import { useGetAllReportBillQuery } from "@/lib/services/modules/report";
import { IReportBillItem } from "@/lib/services/modules/report/type";
import { Feather } from "@expo/vector-icons";
import { endOfMonth, format, startOfMonth } from "date-fns";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import BillDetailModal from "./BillDetailModal";

// Helper for currency format
const formatMoney = (amount: number) => {
    return amount.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
};

const ReportBillScreen = () => {
    const router = useRouter();

    // -- Filter State --
    const [filterVisible, setFilterVisible] = useState(false);
    const [billCode, setBillCode] = useState("");
    const [startDate, setStartDate] = useState(format(startOfMonth(new Date()), 'yyyy-MM-dd'));
    const [endDate, setEndDate] = useState(format(endOfMonth(new Date()), 'yyyy-MM-dd'));

    // -- Date Picker State --
    const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
    const [datePickerMode, setDatePickerMode] = useState<'start' | 'end'>('start');

    // -- Pagination & Data State --
    const [pageIndex, setPageIndex] = useState(1);
    const [allBills, setAllBills] = useState<IReportBillItem[]>([]);
    const [activeFilter, setActiveFilter] = useState({
        limit: 10,
        start_date: startDate,
        end_date: endDate,
        search_bill_code: billCode,
    });

    // -- Detail Modal State --
    const [detailVisible, setDetailVisible] = useState(false);
    const [selectedBillId, setSelectedBillId] = useState<string | null>(null);

    // Query hook
    const { data, isLoading, isFetching, refetch } = useGetAllReportBillQuery({
        page_index: pageIndex,
        limit: activeFilter.limit,
        start_date: activeFilter.start_date,
        end_date: activeFilter.end_date,
        search_bill_code: activeFilter.search_bill_code,
    });

    // -- Effects --

    // Append data when new page loads
    useEffect(() => {
        if (data?.data?.items) {
            const items = data.data.items;
            if (pageIndex === 1) {
                setAllBills(items);
            } else {
                setAllBills(prev => [...prev, ...items]);
            }
        }
    }, [data, pageIndex]);

    // -- Handlers --

    const handleApplyFilter = () => {
        setPageIndex(1);
        setActiveFilter({
            ...activeFilter,
            start_date: startDate,
            end_date: endDate,
            search_bill_code: billCode,
        });
        setFilterVisible(false);
    };

    const handleRefresh = async () => {
        setPageIndex(1);
        refetch();
    };

    const handleLoadMore = () => {
        if (data?.data && pageIndex < data.data.totalPages && !isFetching) {
            setPageIndex(prev => prev + 1);
        }
    };

    const handlePressItem = (id: string) => {
        setSelectedBillId(id);
        setDetailVisible(true);
    };

    const showDatePicker = (mode: 'start' | 'end') => {
        setDatePickerMode(mode);
        setDatePickerVisibility(true);
    };

    const hideDatePicker = () => {
        setDatePickerVisibility(false);
    };

    const handleConfirmDate = (date: Date) => {
        const formatted = format(date, 'yyyy-MM-dd');
        if (datePickerMode === 'start') {
            setStartDate(formatted);
        } else {
            setEndDate(formatted);
        }
        hideDatePicker();
    };

    // -- Renderers --

    const renderItem = ({ item }: { item: IReportBillItem }) => (
        <TouchableOpacity
            style={styles.card}
            activeOpacity={0.7}
            onPress={() => handlePressItem(item.id)}
        >
            <View style={styles.cardTop}>
                <View style={styles.cardIconContainer}>
                    <Feather name="file-text" size={24} color="#FF7043" />
                </View>
                <View style={styles.cardHeaderInfo}>
                    <Text style={styles.billCode}>{item.bill_code}</Text>
                    <Text style={styles.date}>{format(new Date(item.time_end), "dd/MM/yyyy HH:mm")}</Text>
                </View>
                <View style={styles.moneyContainer}>
                    <Text style={styles.totalMoney}>{formatMoney(item.total_money)}</Text>
                </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.cardDetails}>
                <View style={styles.detailRow}>
                    <Feather name="map-pin" size={14} color="#94A3B8" />
                    <Text style={styles.detailText}>{item.table_name} - {item.area_name}</Text>
                </View>
                <View style={styles.detailRow}>
                    <Feather name="user" size={14} color="#94A3B8" />
                    <Text style={styles.detailText}>{item.user_name}</Text>
                </View>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <UIButtonBack />
                <Text style={styles.headerTitle}>Lịch sử hóa đơn</Text>
                <TouchableOpacity onPress={() => setFilterVisible(true)} style={styles.headerFilterBtn}>
                    <Feather name="filter" size={20} color="#1A1A1A" />
                </TouchableOpacity>
            </View>

            {/* List */}
            <FlatList
                data={allBills}
                renderItem={renderItem}
                keyExtractor={(item, index) => `${item.id}-${index}`}
                contentContainerStyle={styles.listContent}
                onRefresh={handleRefresh}
                refreshing={isFetching && pageIndex === 1}
                onEndReached={handleLoadMore}
                onEndReachedThreshold={0.5}
                ListFooterComponent={
                    isFetching && pageIndex > 1 ? (
                        <View style={styles.loadingFooter}>
                            <ActivityIndicator size="small" color="#FF7043" />
                        </View>
                    ) : null
                }
                ListEmptyComponent={
                    !isLoading ? (
                        <View style={styles.emptyContainer}>
                            <Feather name="inbox" size={48} color="#CBD5E1" />
                            <Text style={styles.emptyText}>Không tìm thấy hóa đơn nào</Text>
                        </View>
                    ) : null
                }
            />

            {/* Loading Overlay for initial load */}
            {isLoading && pageIndex === 1 && (
                <View style={styles.loadingOverlay}>
                    <ActivityIndicator size="large" color="#FF7043" />
                </View>
            )}

            {/* Filter Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={filterVisible}
                onRequestClose={() => setFilterVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Bộ lọc tìm kiếm</Text>
                            <TouchableOpacity onPress={() => setFilterVisible(false)}>
                                <Feather name="x" size={24} color="#64748B" />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.modalBody}>
                            {/* Bill Code */}
                            <Text style={styles.inputLabel}>Mã hóa đơn</Text>
                            <View style={styles.inputWrapper}>
                                <UITextField
                                    placeholder="Nhập mã hóa đơn..."
                                    value={billCode}
                                    onChangeText={setBillCode}
                                    leftIcon={<Feather name="search" size={20} color="#94A3B8" />}
                                />
                            </View>

                            {/* Date Range */}
                            <View style={styles.dateRow}>
                                <View style={styles.dateCol}>
                                    <Text style={styles.inputLabel}>Từ ngày</Text>
                                    <TouchableOpacity onPress={() => showDatePicker('start')}>
                                        <View style={styles.dateInput} pointerEvents="none">
                                            <UITextField
                                                placeholder="YYYY-MM-DD"
                                                value={startDate}
                                                editable={false}
                                                rightIcon={<Feather name="calendar" size={18} color="#94A3B8" />}
                                            />
                                        </View>
                                    </TouchableOpacity>
                                </View>
                                <View style={styles.dateCol}>
                                    <Text style={styles.inputLabel}>Đến ngày</Text>
                                    <TouchableOpacity onPress={() => showDatePicker('end')}>
                                        <View style={styles.dateInput} pointerEvents="none">
                                            <UITextField
                                                placeholder="YYYY-MM-DD"
                                                value={endDate}
                                                editable={false}
                                                rightIcon={<Feather name="calendar" size={18} color="#94A3B8" />}
                                            />
                                        </View>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>

                        <View style={styles.modalFooter}>
                            <TouchableOpacity style={styles.resetBtn} onPress={() => {
                                setBillCode("");
                                setStartDate(format(startOfMonth(new Date()), 'yyyy-MM-dd'));
                                setEndDate(format(endOfMonth(new Date()), 'yyyy-MM-dd'));
                            }}>
                                <Text style={styles.resetBtnText}>Đặt lại</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.applyBtn} onPress={handleApplyFilter}>
                                <Text style={styles.applyBtnText}>Áp dụng</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>

                {/* Date Picker must be inside Modal for iOS to work correctly when nested */}
                <DateTimePickerModal
                    isVisible={isDatePickerVisible}
                    mode="date"
                    onConfirm={handleConfirmDate}
                    onCancel={hideDatePicker}
                />
            </Modal>

            {/* Bill Details Modal */}
            <BillDetailModal
                visible={detailVisible}
                billId={selectedBillId}
                onClose={() => setDetailVisible(false)}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F8FAFC",
    },
    // Header
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        paddingTop: 60,
        paddingBottom: 16,
        backgroundColor: "#fff",
        borderBottomWidth: 1,
        borderBottomColor: "#F1F5F9",
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: "600",
        color: "#1E293B",
    },
    headerFilterBtn: {
        padding: 8,
        backgroundColor: "#F1F5F9",
        borderRadius: 8,
    },
    // List
    listContent: {
        padding: 16,
        paddingBottom: 40,
    },
    loadingFooter: {
        paddingVertical: 20,
        alignItems: 'center',
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 100,
    },
    emptyText: {
        marginTop: 12,
        color: "#94A3B8",
        fontSize: 16,
    },
    loadingOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(255,255,255,0.8)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
    },
    // Card
    card: {
        backgroundColor: "#fff",
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        shadowColor: "#64748B",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 12,
        elevation: 2,
    },
    cardTop: {
        flexDirection: "row",
        alignItems: "flex-start",
    },
    cardIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 10,
        backgroundColor: "#FFF7ED", // Orange-50
        justifyContent: "center",
        alignItems: "center",
        marginRight: 12,
    },
    cardHeaderInfo: {
        flex: 1,
    },
    billCode: {
        fontSize: 16,
        fontWeight: "700",
        color: "#1E293B",
        marginBottom: 4,
    },
    date: {
        fontSize: 12,
        color: "#64748B",
    },
    moneyContainer: {
        alignItems: "flex-end",
    },
    totalMoney: {
        fontSize: 14,
        fontWeight: "700",
        color: "#FF7043",
    },
    divider: {
        height: 1,
        backgroundColor: "#F1F5F9",
        marginVertical: 12,
    },
    cardDetails: {
        flexDirection: "row",
        justifyContent: "space-between",
    },
    detailRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
    },
    detailText: {
        fontSize: 13,
        color: "#475569",
        fontWeight: "500",
    },
    // Modal
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.5)",
        justifyContent: "flex-end",
    },
    modalContent: {
        backgroundColor: "#fff",
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 24,
        minHeight: 400,
    },
    modalHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 24,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: "700",
        color: "#1E293B",
    },
    modalBody: {
        marginBottom: 24,
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: "600",
        color: "#475569",
        marginBottom: 8,
    },
    inputWrapper: {
        marginBottom: 20,
    },
    dateRow: {
        flexDirection: "row",
        gap: 12,
    },
    dateCol: {
        flex: 1,
    },
    dateInput: {
        backgroundColor: "#F8FAFC",
        borderRadius: 12,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: "#E2E8F0",
    },
    modalFooter: {
        flexDirection: "row",
        gap: 12,
        marginTop: "auto",
    },
    resetBtn: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 12,
        backgroundColor: "#F1F5F9",
        alignItems: "center",
    },
    resetBtnText: {
        fontSize: 16,
        fontWeight: "600",
        color: "#64748B",
    },
    applyBtn: {
        flex: 2,
        paddingVertical: 14,
        borderRadius: 12,
        backgroundColor: "#FF7043",
        alignItems: "center",
    },
    applyBtnText: {
        fontSize: 16,
        fontWeight: "600",
        color: "#fff",
    },
});

export default ReportBillScreen;

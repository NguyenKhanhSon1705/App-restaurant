import { useGetRevenueReportQuery } from "@/lib/services/modules/statistics";
import { IDishInfo } from "@/lib/services/modules/statistics/type";
import { Feather } from "@expo/vector-icons";
import { endOfMonth, format, startOfMonth } from "date-fns";
import React, { useState } from "react";
import { ActivityIndicator, Image, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { SafeAreaView } from "react-native-safe-area-context";

// Helper for currency format
const formatMoney = (amount: number) => {
    return amount.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
};

const StatisticsScreen = () => {
    // -- Date State --
    const [startDate, setStartDate] = useState(format(startOfMonth(new Date()), 'yyyy-MM-dd'));
    const [endDate, setEndDate] = useState(format(endOfMonth(new Date()), 'yyyy-MM-dd'));

    // -- Date Picker State --
    const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
    const [datePickerMode, setDatePickerMode] = useState<'start' | 'end'>('start');

    // -- Query --
    const { data, isLoading, refetch, isFetching } = useGetRevenueReportQuery({
        start_date: startDate,
        end_date: endDate,
    });

    const stats = data?.data;

    // -- Handlers --

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

    const onRefresh = React.useCallback(() => {
        refetch();
    }, [refetch]);

    // -- Renderers --

    const renderSummaryCard = (title: string, value: string | number, icon: any, color: string, subValue?: string) => (
        <View style={styles.card}>
            <View style={[styles.cardIcon, { backgroundColor: `${color}15` }]}>
                <Feather name={icon} size={24} color={color} />
            </View>
            <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>{title}</Text>
                <Text style={[styles.cardValue, { color: color }]}>{value}</Text>
                {subValue && <Text style={styles.cardSubValue}>{subValue}</Text>}
            </View>
        </View>
    );

    const renderDishItem = ({ item, index, type }: { item: IDishInfo, index: number, type: 'hot' | 'cold' }) => (
        <View style={styles.dishItem}>
            <View style={styles.dishRank}>
                <Text style={[styles.rankText, { color: type === 'hot' ? '#FF7043' : '#64748B' }]}>#{index + 1}</Text>
            </View>
            <Image
                source={item.image ? { uri: item.image } : require("@/assets/images/default-food.png")}
                style={styles.dishImage}
            />
            <View style={styles.dishInfo}>
                <Text style={styles.dishName} numberOfLines={2}>{item.dish_Name}</Text>
                <Text style={styles.dishPrice}>{formatMoney(item.selling_Price)}</Text>
            </View>
            <View style={styles.dishStats}>
                <Text style={styles.dishQuantity}>{item.quantity}</Text>
                <Text style={styles.dishStatsLabel}>đã bán</Text>
            </View>
        </View>
    );

    if (isLoading && !stats) {
        return (
            <View style={[styles.container, styles.center]}>
                <ActivityIndicator size="large" color="#FF7043" />
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.headerContainer}>
                <View>
                    <Text style={styles.headerTitle}>Thống kê doanh thu</Text>
                    <Text style={styles.headerSubtitle}>Tổng quan doanh thu cửa hàng</Text>
                </View>
            </View>

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                refreshControl={
                    <RefreshControl refreshing={isFetching} onRefresh={onRefresh} colors={["#FF7043"]} />
                }
            >
                {/* Date Filter */}
                <View style={styles.filterSection}>
                    <TouchableOpacity style={styles.dateBtn} onPress={() => showDatePicker('start')}>
                        <Feather name="calendar" size={16} color="#64748B" />
                        <Text style={styles.dateText}>{startDate}</Text>
                    </TouchableOpacity>
                    <Feather name="arrow-right" size={16} color="#94A3B8" />
                    <TouchableOpacity style={styles.dateBtn} onPress={() => showDatePicker('end')}>
                        <Feather name="calendar" size={16} color="#64748B" />
                        <Text style={styles.dateText}>{endDate}</Text>
                    </TouchableOpacity>
                </View>

                {/* Summary Grid */}
                <View style={styles.gridContainer}>
                    <View style={styles.gridRow}>
                        {renderSummaryCard("Tổng doanh thu", formatMoney(stats?.total_nuvenue || 0), "dollar-sign", "#059669")}
                        {renderSummaryCard("Đang chờ", formatMoney(stats?.pendding_nuvenue || 0), "clock", "#D97706")}
                    </View>
                    <View style={styles.gridRow}>
                        {renderSummaryCard("Chuyển khoản", formatMoney(stats?.total_transaction_online || 0), "credit-card", "#2563EB")}
                        {renderSummaryCard("Số hóa đơn", stats?.total_billed || 0, "file-text", "#475569")}
                    </View>
                    <View style={styles.gridRow}>
                        {renderSummaryCard("Tiền hủy", formatMoney(stats?.total_aborted_money || 0), "trash-2", "#EF4444")}
                        {renderSummaryCard("Đơn hủy", stats?.total_aborted || 0, "x-circle", "#EF4444")}
                    </View>
                </View>

                {/* Top Selling Dishes */}
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Món bán chạy nhất</Text>
                    <Feather name="trending-up" size={20} color="#FF7043" />
                </View>
                <View style={styles.listContainer}>
                    {stats?.list_dish_hot && stats.list_dish_hot.length > 0 ? (
                        stats.list_dish_hot.map((item, index) => (
                            <React.Fragment key={`hot-${item.id}`}>
                                {renderDishItem({ item, index, type: 'hot' })}
                                {index < stats.list_dish_hot.length - 1 && <View style={styles.divider} />}
                            </React.Fragment>
                        ))
                    ) : (
                        <Text style={styles.emptyText}>Chưa có dữ liệu</Text>
                    )}
                </View>

                {/* Least Selling Dishes */}
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Món bán chậm nhất</Text>
                    <Feather name="trending-down" size={20} color="#64748B" />
                </View>
                <View style={styles.listContainer}>
                    {stats?.list_dish_not_hot && stats.list_dish_not_hot.length > 0 ? (
                        stats.list_dish_not_hot.map((item, index) => (
                            <React.Fragment key={`cold-${item.id}`}>
                                {renderDishItem({ item, index, type: 'cold' })}
                                {index < stats.list_dish_not_hot.length - 1 && <View style={styles.divider} />}
                            </React.Fragment>
                        ))
                    ) : (
                        <Text style={styles.emptyText}>Chưa có dữ liệu</Text>
                    )}
                </View>

            </ScrollView>

            <DateTimePickerModal
                isVisible={isDatePickerVisible}
                mode="date"
                onConfirm={handleConfirmDate}
                onCancel={hideDatePicker}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F8FAFC",
    },
    center: {
        justifyContent: 'center',
        alignItems: 'center',
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
    scrollContent: {
        padding: 16,
        paddingBottom: 120,
    },
    filterSection: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: "#fff",
        padding: 12,
        borderRadius: 12,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: "#E2E8F0",
    },
    dateBtn: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        padding: 8,
        backgroundColor: "#F8FAFC",
        borderRadius: 8,
        flex: 1,
        justifyContent: "center",
    },
    dateText: {
        fontSize: 14,
        color: "#475569",
        fontWeight: "500",
    },
    gridContainer: {
        gap: 12,
        marginBottom: 24,
    },
    gridRow: {
        flexDirection: "row",
        gap: 12,
    },
    card: {
        flex: 1,
        backgroundColor: "#fff",
        padding: 16,
        borderRadius: 16,
        flexDirection: "column",
        shadowColor: "#64748B",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    cardIcon: {
        width: 40,
        height: 40,
        borderRadius: 10,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 12,
    },
    cardContent: {
        gap: 4,
    },
    cardTitle: {
        fontSize: 13,
        color: "#64748B",
        fontWeight: "500",
    },
    cardValue: {
        fontSize: 16,
        fontWeight: "700",
    },
    cardSubValue: {
        fontSize: 12,
        color: "#94A3B8",
    },
    sectionHeader: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 12,
        marginTop: 8,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: "700",
        color: "#1E293B",
    },
    listContainer: {
        backgroundColor: "#fff",
        borderRadius: 16,
        padding: 16,
        marginBottom: 24,
        shadowColor: "#64748B",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    dishItem: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
    },
    dishRank: {
        width: 24,
        alignItems: "center",
    },
    rankText: {
        fontSize: 16,
        fontWeight: "700",
    },
    dishImage: {
        width: 48,
        height: 48,
        borderRadius: 8,
        backgroundColor: "#F1F5F9",
    },
    dishInfo: {
        flex: 1,
    },
    dishName: {
        fontSize: 14,
        fontWeight: "600",
        color: "#1E293B",
        marginBottom: 4,
    },
    dishPrice: {
        fontSize: 12,
        color: "#64748B",
        fontWeight: "500",
    },
    dishStats: {
        alignItems: "flex-end",
    },
    dishQuantity: {
        fontSize: 16,
        fontWeight: "700",
        color: "#1E293B",
    },
    dishStatsLabel: {
        fontSize: 10,
        color: "#94A3B8",
    },
    divider: {
        height: 1,
        backgroundColor: "#F1F5F9",
        marginVertical: 12,
    },
    emptyText: {
        textAlign: "center",
        color: "#94A3B8",
        paddingVertical: 12,
    },
});

export default StatisticsScreen;

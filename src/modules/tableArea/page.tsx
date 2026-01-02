import Loading from "@/app/loading";
import { useGetTableAreaDataQuery } from "@/lib/services/modules";
import { ROUTE } from "@/routers";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
    Dimensions,
    FlatList,
    Pressable,
    RefreshControl,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Area from "./components/area";
import { ITableAreaData } from "./tableArea.type";

const { width } = Dimensions.get("window");
const COLUMN_COUNT = 3;
const GAP = 12;
const PADDING = 16;
// Calculate width: (Screen Width - Padding*2 - Gap*(Columns-1)) / Columns
const ITEM_WIDTH = (width - (PADDING * 2) - (GAP * (COLUMN_COUNT - 1))) / COLUMN_COUNT;

export default function TableAreaPage() {
    const router = useRouter();
    const [drawerVisible, setDrawerVisible] = useState(false);
    const [activeArea, setActiveArea] = useState<{ areaId?: number; areaName?: string }>({});
    const { data, refetch, isLoading, isFetching } = useGetTableAreaDataQuery(activeArea.areaId);

    const handleOpenDrawer = useCallback(() => {
        setDrawerVisible(true);
    }, []);

    useFocusEffect(
        useCallback(() => {
            refetch();
        }, [refetch])
    );

    const handleCloseDrawer = useCallback(() => {
        setDrawerVisible(false);
    }, []);

    const handleSelectArea = useCallback((areaId: number, areaName: string) => {
        setActiveArea({ areaId, areaName });
    }, []);

    const handleSelectTable = (item: ITableAreaData) => {
        router.push({
            pathname: ROUTE.TABLE_DISH,
            params: { tableId: item.id, tableName: item.nameTable },
        });
    };

    const onRefresh = useCallback(() => {
        refetch();
    }, [refetch]);

    const renderItem = ({ item }: { item: ITableAreaData }) => {
        // Assuming item.isActive represents availability (True = Active/Available, False = Inactive/Busy)
        // Adjust logic if isActive means "Is currently selected" or "Is occupied".
        // Based on original code: isActive ? "#8cc1ec" (Blue) : "#ffcccc" (Red)
        // Let's interpret: isActive = True (Available/Blue), False (Occupied/Red)

        const isAvailable = !item.isActive;

        return (
            <Pressable
                onPress={() => handleSelectTable(item)}
                style={({ pressed }) => [
                    styles.card,
                    {
                        backgroundColor: isAvailable ? "#F0F9FF" : "#FEF2F2",
                        borderColor: isAvailable ? "#BAE6FD" : "#FECACA",
                        transform: [{ scale: pressed ? 0.98 : 1 }]
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
                    styles.tableName,
                    { color: isAvailable ? "#0369A1" : "#991B1B" }
                ]} numberOfLines={1}>
                    {item.nameTable}
                </Text>

                <View style={[
                    styles.statusDot,
                    { backgroundColor: isAvailable ? "#22C55E" : "#EF4444" }
                ]} />
            </Pressable>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Header Section */}
            <View style={styles.header}>
                <View>
                    <Text style={styles.headerTitle}>Chọn Bàn</Text>
                    <Text style={styles.headerSubtitle}>
                        {activeArea.areaName ? `Khu vực: ${activeArea.areaName}` : "Tất cả khu vực"}
                    </Text>
                </View>
                <TouchableOpacity
                    style={styles.filterButton}
                    onPress={handleOpenDrawer}
                >
                    <Ionicons name="filter" size={20} color="#ff8c47" />
                    <Text style={styles.filterText}>Khu vực</Text>
                </TouchableOpacity>
            </View>

            {/* Content Section */}
            {isLoading && !data ? (
                <View style={styles.loadingContainer}>
                    <Loading />
                </View>
            ) : (
                <FlatList
                    data={data?.data}
                    keyExtractor={(item, index) => item.id?.toString() || index.toString()}
                    renderItem={renderItem}
                    numColumns={COLUMN_COUNT}
                    contentContainerStyle={styles.listContent}
                    columnWrapperStyle={styles.columnWrapper}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl refreshing={isFetching} onRefresh={onRefresh} colors={["#ff8c47"]} />
                    }
                    ListEmptyComponent={() => (
                        <View style={styles.emptyContainer}>
                            <Ionicons name="search-outline" size={64} color="#E5E7EB" />
                            <Text style={styles.emptyText}>Không tìm thấy bàn nào</Text>
                            <Text style={styles.emptySubText}>Vui lòng chọn khu vực khác hoặc thêm bàn mới</Text>
                        </View>
                    )}
                />
            )}

            {/* Drawer */}
            <Area
                visible={drawerVisible}
                onClose={handleCloseDrawer}
                onSelectArea={handleSelectArea}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F9FAFB",
    },
    header: {
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
    filterButton: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#FFF7ED",
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: "#ff8c47",
    },
    filterText: {
        color: "#ff8c47",
        fontWeight: "600",
        marginLeft: 4,
        fontSize: 14,
    },
    listContent: {
        padding: PADDING,
        paddingBottom: 40,
    },
    columnWrapper: {
        gap: GAP,
        marginBottom: GAP,
    },
    card: {
        width: ITEM_WIDTH,
        height: ITEM_WIDTH * 1.1, // Slightly taller than square
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
    iconBadge: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 8,
    },
    tableName: {
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
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
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
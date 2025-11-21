import { useGetTableAreaDataQuery } from "@/lib/services/modules";
import { useCallback, useState } from "react";
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text } from "react-native";
import { Button, Surface } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import Area from "./components/area";
import { ITableAreaData } from "./tableArea.type";

export default function TableAreaPage() {
    // const router = useRouter()
    const [drawerVisible, setDrawerVisible] = useState(false);
    const [activeArea, setActiveArea] = useState<{ areaId?: number; areaName?: string }>({});
    const [refreshing, setRefreshing] = useState(false);
    const {data} = useGetTableAreaDataQuery(activeArea.areaId)
    const handleOpenDrawer = useCallback(() => {
        setDrawerVisible(true);
    }, []);

    const handleCloseDrawer = useCallback(() => {
        setDrawerVisible(false);
    }, []);

    const handleSelectArea = useCallback((areaId: number, areaName: string) => {
        setActiveArea({ areaId, areaName });
    }, []);

    const handleSelectTable = (item: ITableAreaData) => {
        // router.push({
        //     pathname: "tabledish/tabledish",
        //     params: { tableId: item.id, tableName: item.nameTable },
        // });
    };
    const onRefresh = useCallback(() => {
        if (!activeArea.areaId) return;
        setRefreshing(true);
    }, [activeArea.areaId]);
    return (
        <SafeAreaView style={{ flex: 1 }}>
            {
                // loading && <Loading />
            }
            <Button
                style={{
                    height: 45,
                    width: 150,
                    margin: 10,
                    marginLeft: 20,
                    borderColor: "#ff8c47",
                    borderWidth: 2,
                    borderRadius: 5,
                }}
                icon={"storefront"}
                labelStyle={{ fontSize: 18 }}
                textColor="#ff8c47"
                mode="outlined"
                onPress={handleOpenDrawer}
            >
                {activeArea.areaName ? activeArea.areaName : "Khu vực"}
            </Button>
            <ScrollView
                contentContainerStyle={styles.container}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            >
                {data?.data?.map((item: ITableAreaData, index: any) => (
                    <Pressable
                        key={index}
                        onPress={() => handleSelectTable(item)}
                        style={styles.item}
                    >
                        <Surface
                            style={[
                                styles.surface,
                                {
                                    backgroundColor: item.isActive ? "#8cc1ec" : "#ffcccc",
                                    borderColor: item.isActive ? "#ccc" : "#f6dede",
                                    borderWidth: 2,
                                },
                            ]}
                            elevation={1}
                        >
                            <Text>{item.nameTable}</Text>
                        </Surface>
                    </Pressable>
                ))}
            </ScrollView>
            {/* Drawer khu vực */}
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
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'flex-start',
        paddingHorizontal: 10,
    },
    item: {
        width: '33.33%',
        padding: 10,
        alignItems: 'center',
    },
    surface: {
        width: '100%',
        height: 100,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 8,
        backgroundColor: '#f0f0f0',
    },
    tooltip: {
        position: "absolute",
        top: -5,
        right: -5,
        backgroundColor: "#f39c12",
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
    },
    tooltipText: {
        color: "white",
        fontSize: 12,
    },
});
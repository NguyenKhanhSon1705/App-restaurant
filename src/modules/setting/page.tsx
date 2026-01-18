import { images } from "@/assets/images";
import { IUser } from "@/common/types";
import { removeAuthFromStorage, USER_LOGOUT } from "@/common/utils";
import { UIButtonBack } from "@/core/ui";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { useFetchCurrentUserQuery } from "@/lib/services/modules";
import { RootState } from "@/lib/services/store";
import { ROUTE } from "@/routers";
import {
    AntDesign,
    Feather,
    Ionicons,
    MaterialIcons
} from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { Avatar } from "react-native-paper";

// -----------------------------------------
// MENU CONFIG
// -----------------------------------------
const menuItems = [
    {
        key: 1,
        title: "Personal Info",
        icon: <Ionicons name="person-outline" size={20} color="#FF8A65" />,
    },
    {
        key: 2,
        title: "Thay đổi chi nhánh",
        icon: <MaterialIcons name="storefront" size={20} color="#7E57C2" />,
    },
    {
        key: 9,
        title: "Lịch sử hóa đơn",
        icon: <Ionicons name="receipt-outline" size={20} color="#FF7043" />,
    },
    {
        key: 10,
        title: "Settings",
        icon: <Feather name="settings" size={20} color="#9575CD" />,
    },
];
function MenuItem({
    icon,
    title,
    onPress,
}: {
    icon: React.ReactNode;
    title: string;
    onPress: () => void;
}) {
    return (
        <TouchableOpacity onPress={onPress} style={styles.menuItem}>
            <View style={styles.iconWrapper}>{icon}</View>
            <Text style={styles.menuText}>{title}</Text>
            <Feather
                name="chevron-right"
                size={20}
                color="#999"
                style={{ marginLeft: "auto" }}
            />
        </TouchableOpacity>
    );
}

// -----------------------------------------
// MAIN COMPONENT
// -----------------------------------------
export default function SettingPage() {
    const router = useRouter();
    const user = useAppSelector(
        (state: RootState) => state.user.user
    ) as IUser;

    const { refetch, isFetching } = useFetchCurrentUserQuery(null);

    const onRefresh = async () => {
        await refetch();
    };

    const handleMenuPress = (key: number) => {
        switch (key) {
            case 1:
                // router.push(ROUTE.USERPROFILE);
                break;
            case 2:
                router.push(ROUTE.SWITCH_SHOP);
                break;
            case 9:
                router.push(ROUTE.REPORT_BILL);
                break;
            default:
                console.log("Invalid key");
        }
    };

    const dispatch = useAppDispatch();

    const handleLogout = () => {
        Alert.alert("Đăng xuất", "Bạn có muốn đăng xuất không?", [
            { text: "Hủy", style: "cancel" },
            {
                text: "Đăng xuất",
                style: "destructive",
                onPress: async () => {
                    await removeAuthFromStorage();
                    dispatch({ type: USER_LOGOUT });
                    router.replace(ROUTE.LOGIN);
                },
            },
        ]);
    };

    return (
        <ScrollView style={styles.container}>
            {/* HEADER */}
            <View style={styles.header}>
                <UIButtonBack />
                <Text style={styles.headerText}>Profile</Text>
                <TouchableOpacity>
                    <Feather name="more-horizontal" size={24} />
                </TouchableOpacity>
            </View>

            {/* PROFILE */}
            <View style={styles.profileContainer}>
                <Avatar.Image
                    size={80}
                    source={user?.picture || images.avt_default}
                    style={styles.avatar}
                />
                <Text style={styles?.name}>{user?.fullName || "Chưa đặt tên"}</Text>
                <Text style={styles.subtitle}>{user?.email}</Text>
            </View>

            {/* MENU LIST */}
            <View style={styles.menuWrapper}>
                {menuItems.map((item) => (
                    <MenuItem
                        key={item.key}
                        icon={item.icon}
                        title={item.title}
                        onPress={() => handleMenuPress(item.key)}
                    />
                ))}

                {/* LOG OUT */}
                <MenuItem
                    icon={<AntDesign name="logout" size={20} color="#EF5350" />}
                    title="Log Out"
                    onPress={handleLogout}
                />
            </View>
        </ScrollView>
    );
}

// -----------------------------------------
// STYLES (GIỮ NGUYÊN UI)
// -----------------------------------------
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f7f9fb",
        paddingHorizontal: 20,
        marginBottom: 100,
    },
    header: {
        marginTop: 60,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    headerText: {
        fontSize: 18,
        fontWeight: "600",
    },
    profileContainer: {
        alignItems: "center",
        marginVertical: 20,
    },
    avatar: {
        backgroundColor: "transparent",
    },
    name: {
        fontSize: 18,
        fontWeight: "700",
        marginTop: 12,
    },
    subtitle: {
        color: "#999",
        marginTop: 4,
    },
    menuWrapper: {
        marginTop: 10,
    },
    menuItem: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#fff",
        borderRadius: 14,
        padding: 16,
        marginBottom: 12,
        shadowColor: "#000",
        shadowOpacity: 0.02,
        shadowRadius: 8,
        elevation: 1,
    },
    iconWrapper: {
        marginRight: 14,
    },
    menuText: {
        fontSize: 16,
        fontWeight: "500",
    },
});

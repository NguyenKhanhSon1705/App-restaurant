import { useGetAreaDataQuery } from '@/lib/services/modules/area';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
    Animated,
    Dimensions,
    Easing,
    FlatList,
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View
} from 'react-native';

const screenWidth = Dimensions.get('window').width;
const drawerWidth = screenWidth * 0.75; // Slightly wider for better readability

type Props = {
    visible: boolean;
    onClose: () => void;
    onSelectArea?: (areaId: number, areaName: string) => void;
};

const Area = ({ visible, onClose, onSelectArea }: Props) => {
    const slideAnim = useRef(new Animated.Value(-drawerWidth)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const { data, refetch } = useGetAreaDataQuery();
    const [activeAreaId, setActiveAreaId] = useState<number | null>(null);
    const [isDrawerVisible, setDrawerVisible] = useState(false);

    useFocusEffect(
        useCallback(() => {
            refetch()
        }, [refetch])
    );

    useEffect(() => {
        if (visible) {
            setDrawerVisible(true);
            Animated.parallel([
                Animated.timing(slideAnim, {
                    toValue: 0,
                    duration: 300,
                    easing: Easing.out(Easing.ease),
                    useNativeDriver: true,
                }),
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: true,
                })
            ]).start();
        } else {
            Animated.parallel([
                Animated.timing(slideAnim, {
                    toValue: -drawerWidth,
                    duration: 250,
                    easing: Easing.in(Easing.ease),
                    useNativeDriver: true,
                }),
                Animated.timing(fadeAnim, {
                    toValue: 0,
                    duration: 250,
                    useNativeDriver: true,
                })
            ]).start(() => {
                setDrawerVisible(false);
                onClose();
            });
        }
    }, [visible]);

    const handleSelect = useCallback(
        (areaId: number, areaName: string) => {
            setActiveAreaId(areaId);
            // Delay slightly to show selection effect before closing
            setTimeout(() => {
                if (onSelectArea) onSelectArea(areaId, areaName);
                Animated.parallel([
                    Animated.timing(slideAnim, {
                        toValue: -drawerWidth,
                        duration: 250,
                        easing: Easing.in(Easing.ease),
                        useNativeDriver: true,
                    }),
                    Animated.timing(fadeAnim, {
                        toValue: 0,
                        duration: 250,
                        useNativeDriver: true,
                    })
                ]).start(() => {
                    setDrawerVisible(false);
                    onClose();
                });
            }, 100);
        },
        [onSelectArea, onClose]
    );

    const handleBackdropPress = useCallback(() => {
        Animated.parallel([
            Animated.timing(slideAnim, {
                toValue: -drawerWidth,
                duration: 250,
                easing: Easing.in(Easing.ease),
                useNativeDriver: true,
            }),
            Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 250,
                useNativeDriver: true,
            })
        ]).start(() => {
            setDrawerVisible(false);
            onClose();
        });
    }, [onClose]);

    if (!isDrawerVisible) return null;

    const renderItem = ({ item }: { item: any }) => {
        const isActive = activeAreaId === item.id;
        return (
            <TouchableOpacity
                style={[
                    styles.itemContainer,
                    isActive && styles.activeItemContainer
                ]}
                onPress={() => handleSelect(item.id, item.areaName)}
            >
                <View style={[styles.iconBox, isActive ? styles.activeIconBox : styles.inactiveIconBox]}>
                    <Ionicons
                        name={isActive ? "radio-button-on" : "radio-button-off"}
                        size={20}
                        color={isActive ? "#0284C7" : "#9CA3AF"}
                    />
                </View>
                <Text style={[styles.itemText, isActive && styles.activeItemText]}>
                    {item.areaName}
                </Text>
                {isActive && (
                    <Ionicons name="checkmark" size={20} color="#0284C7" style={styles.checkIcon} />
                )}
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback onPress={handleBackdropPress}>
                <Animated.View style={[styles.backdrop, { opacity: fadeAnim }]} />
            </TouchableWithoutFeedback>

            <Animated.View
                style={[
                    styles.drawerContainer,
                    {
                        width: drawerWidth,
                        transform: [{ translateX: slideAnim }]
                    },
                ]}
            >
                <SafeAreaView style={styles.contentContainer}>
                    <View style={styles.header}>
                        <Text style={styles.headerTitle}>Chọn Khu Vực</Text>
                        <TouchableOpacity onPress={handleBackdropPress} style={styles.closeButton}>
                            <Ionicons name="close" size={24} color="#6B7280" />
                        </TouchableOpacity>
                    </View>

                    <FlatList
                        data={data?.data}
                        keyExtractor={(item) => item.id.toString()}
                        renderItem={renderItem}
                        contentContainerStyle={styles.listContent}
                        showsVerticalScrollIndicator={false}
                    />
                </SafeAreaView>
            </Animated.View>
        </View>
    );
};

export default React.memo(Area);

const styles = StyleSheet.create({
    modalOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        height: '100%',
        width: '100%',
        zIndex: 999,
    },
    backdrop: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    drawerContainer: {
        height: '100%',
        backgroundColor: '#fff',
        zIndex: 1000,
        shadowColor: "#000",
        shadowOffset: { width: 4, height: 0 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 10,
    },
    contentContainer: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#111827',
    },
    closeButton: {
        padding: 4,
    },
    listContent: {
        padding: 16,
    },
    itemContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 12,
        marginBottom: 8,
    },
    activeItemContainer: {
        backgroundColor: '#F0F9FF',
    },
    iconBox: {
        marginRight: 12,
    },
    activeIconBox: {
        // Additional style if needed
    },
    inactiveIconBox: {
        // Additional style if needed
    },
    itemText: {
        fontSize: 16,
        fontWeight: '500',
        color: '#374151',
        flex: 1,
    },
    activeItemText: {
        color: '#0284C7',
        fontWeight: '600',
    },
    checkIcon: {
        marginLeft: 8,
    },
});

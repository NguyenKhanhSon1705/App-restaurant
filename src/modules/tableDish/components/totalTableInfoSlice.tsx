import { ITableDishData } from '@/lib/services/modules/tableDish/type';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
    Animated,
    Dimensions,
    Easing,
    StyleSheet,
    Text,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View,
} from 'react-native';
import { Surface } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

const screenWidth = Dimensions.get('window').width;
const drawerWidth = screenWidth * 0.8; // Slightly wider for better info display

type Props = {
    visible: boolean;
    table: ITableDishData;
    onClose: () => void;
    onSelectArea?: (areaId: number, areaName: string) => void;
};

const formatDuration = (seconds: number) => {
    const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
    const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
    const s = Math.floor(seconds % 60).toString().padStart(2, '0');
    return `${h}:${m}:${s}`;
};

const TotalTableInfoSlice = ({ visible, onClose, table }: Props) => {
    const slideAnim = useRef(new Animated.Value(drawerWidth)).current; // Start from right
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const [isDrawerVisible, setDrawerVisible] = useState(false);
    const [duration, setDuration] = useState(0);

    // Timer Logic
    useEffect(() => {
        if (table.timeStart && table.isActive) {
            const start = new Date(table.timeStart).getTime();
            const updateDuration = () => {
                const now = new Date().getTime();
                const seconds = Math.floor((now - start) / 1000);
                setDuration(seconds);
            };

            updateDuration();
            const interval = setInterval(updateDuration, 1000);
            return () => clearInterval(interval);
        } else {
            setDuration(0);
        }
    }, [table.timeStart, table.isActive]);

    // Animation Logic
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
                }),
            ]).start();
        } else {
            Animated.parallel([
                Animated.timing(slideAnim, {
                    toValue: drawerWidth, // Slide out to right
                    duration: 250,
                    easing: Easing.in(Easing.ease),
                    useNativeDriver: true,
                }),
                Animated.timing(fadeAnim, {
                    toValue: 0,
                    duration: 250,
                    useNativeDriver: true,
                }),
            ]).start(() => {
                setDrawerVisible(false);
                onClose();
            });
        }
    }, [visible]);

    const handleBackdropPress = useCallback(() => {
        Animated.parallel([
            Animated.timing(slideAnim, {
                toValue: drawerWidth,
                duration: 250,
                easing: Easing.in(Easing.ease),
                useNativeDriver: true,
            }),
            Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 250,
                useNativeDriver: true,
            }),
        ]).start(() => {
            setDrawerVisible(false);
            onClose();
        });
    }, [onClose]);

    if (!isDrawerVisible) return null;

    const totalPrice = Math.ceil(duration / 60) * (table.priceOfMunite || 0);

    return (
        <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback onPress={handleBackdropPress}>
                <Animated.View style={[styles.backdrop, { opacity: fadeAnim }]} />
            </TouchableWithoutFeedback>

            <Animated.View
                style={[
                    styles.drawerContainer,
                    { width: drawerWidth, transform: [{ translateX: slideAnim }] },
                ]}
            >
                <SafeAreaView style={styles.safeArea} edges={['top', 'bottom', 'right']}>
                    {/* Header */}
                    <View style={styles.header}>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.headerTitle}>Chi tiết bàn</Text>
                            <Text style={styles.tableNameMain}>{table.nameTable}</Text>
                        </View>
                        <TouchableOpacity onPress={handleBackdropPress} style={styles.closeButton}>
                            <Ionicons name="close" size={24} color="#6B7280" />
                        </TouchableOpacity>
                    </View>

                    {/* Content Scrollable if needed, but here simple view */}
                    <View style={styles.content}>
                        {/* Status Badges */}
                        <View style={styles.statusRow}>
                            <View style={[styles.statusBadge, { backgroundColor: table.isActive ? '#DCFCE7' : '#FEE2E2' }]}>
                                <View style={[styles.statusDot, { backgroundColor: table.isActive ? '#16A34A' : '#EF4444' }]} />
                                <Text style={[styles.statusText, { color: table.isActive ? '#15803D' : '#991B1B' }]}>
                                    {table.isActive ? 'Đang hoạt động' : 'Trống'}
                                </Text>
                            </View>
                            <View style={styles.areaBadge}>
                                <Ionicons name="storefront-outline" size={14} color="#6B7280" />
                                <Text style={styles.areaText}>{table.areaName}</Text>
                            </View>
                        </View>

                        {/* Main Stats Cards */}
                        {table.isActive ? (
                            <View style={styles.statsGrid}>
                                <Surface style={styles.statCard} elevation={2}>
                                    <View style={[styles.iconCircle, { backgroundColor: '#E0F2FE' }]}>
                                        <Ionicons name="time-outline" size={24} color="#0284C7" />
                                    </View>
                                    <Text style={styles.statLabel}>Thời gian</Text>
                                    <Text style={styles.statValue}>{formatDuration(duration)}</Text>
                                </Surface>

                                {table.hasHourlyRate && (
                                    <Surface style={styles.statCard} elevation={2}>
                                        <View style={[styles.iconCircle, { backgroundColor: '#FEF3C7' }]}>
                                            <Ionicons name="cash-outline" size={24} color="#D97706" />
                                        </View>
                                        <Text style={styles.statLabel}>Tạm tính</Text>
                                        <Text style={styles.statValuePrice}>{totalPrice.toLocaleString()} đ</Text>
                                    </Surface>
                                )}
                            </View>
                        ) : (
                            <View style={styles.emptyState}>
                                <Ionicons name="restaurant-outline" size={64} color="#E5E7EB" />
                                <Text style={styles.emptyText}>Bàn chưa có khách</Text>
                            </View>
                        )}

                        <View style={styles.divider} />

                        {/* Details List */}
                        <View style={styles.detailsList}>
                            <View style={styles.detailRow}>
                                <Text style={styles.detailLabel}>Giờ vào:</Text>
                                <Text style={styles.detailValue}>
                                    {table.timeStart ? format(new Date(table.timeStart), 'HH:mm dd/MM/yyyy') : '--:--'}
                                </Text>
                            </View>
                            <View style={styles.detailRow}>
                                <Text style={styles.detailLabel}>Loại bàn:</Text>
                                <Text style={styles.detailValue}>{table.isBooking ? 'Đặt trước' : 'Thường'}</Text>
                            </View>
                            {table.hasHourlyRate && (
                                <View style={styles.detailRow}>
                                    <Text style={styles.detailLabel}>Giá theo giờ:</Text>
                                    <Text style={styles.detailValue}>{table.priceOfMunite?.toLocaleString()} đ/phút</Text>
                                </View>
                            )}
                        </View>
                    </View>
                </SafeAreaView>
            </Animated.View>
        </View>
    );
};

export default React.memo(TotalTableInfoSlice);

const styles = StyleSheet.create({
    modalOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        height: '100%',
        width: '100%',
        zIndex: 999,
        flexDirection: 'row',
        justifyContent: 'flex-end', // Align drawer to right
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
        shadowColor: "#000",
        shadowOffset: { width: -2, height: 0 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 5,
    },
    safeArea: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    headerTitle: {
        fontSize: 14,
        color: '#6B7280',
        textTransform: 'uppercase',
        fontWeight: '600',
        marginBottom: 4,
    },
    tableNameMain: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#111827',
    },
    closeButton: {
        padding: 4,
        backgroundColor: '#F3F4F6',
        borderRadius: 20,
    },
    content: {
        padding: 20,
    },
    statusRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 24,
        gap: 12,
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 6,
        paddingHorizontal: 10,
        borderRadius: 20,
    },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: 6,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '600',
    },
    areaBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 6,
        paddingHorizontal: 10,
        borderRadius: 20,
        backgroundColor: '#F3F4F6',
        gap: 4,
    },
    areaText: {
        fontSize: 12,
        color: '#4B5563',
        fontWeight: '500',
    },
    statsGrid: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 24,
    },
    statCard: {
        flex: 1,
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        alignItems: 'center',
    },
    iconCircle: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
    },
    statLabel: {
        fontSize: 12,
        color: '#6B7280',
        marginBottom: 4,
    },
    statValue: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#111827',
    },
    statValuePrice: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#D97706',
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 32,
        backgroundColor: '#F9FAFB',
        borderRadius: 16,
        marginBottom: 24,
    },
    emptyText: {
        color: '#9CA3AF',
        marginTop: 8,
        fontWeight: '500',
    },
    divider: {
        height: 1,
        backgroundColor: '#F3F4F6',
        marginBottom: 24,
    },
    detailsList: {
        gap: 16,
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    detailLabel: {
        fontSize: 14,
        color: '#6B7280',
    },
    detailValue: {
        fontSize: 14,
        fontWeight: '600',
        color: '#374151',
    },
});

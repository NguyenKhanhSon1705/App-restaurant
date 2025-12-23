import { AvatarPicker } from '@/common/utils';
import { MaterialIcons } from '@expo/vector-icons';
import React, { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
    KeyboardAvoidingView,
    Modal,
    Platform,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View
} from 'react-native';
import { IShopData } from '../switchRestaurant.type';

interface ShopModalProps {
    visible: boolean;
    onClose: () => void;
    onSubmit: (data: IShopData) => void;
    editData?: IShopData;
}

const ShopModal: React.FC<ShopModalProps> = ({ visible, onClose, onSubmit, editData }) => {
    const { control, handleSubmit, reset, formState: { errors } } = useForm<IShopData>({
        defaultValues: {
            id: 0,
            shopName: '',
            shopPhone: '',
            shopLogo: '',
            shopAddress: '',
            isActive: true,
        }
    });

    useEffect(() => {
        if (editData) {
            reset(editData);
        }
    }, [editData]);

    useEffect(() => {
        if (!visible) {
            reset({
                id: 0,
                shopName: '',
                shopPhone: '',
                shopLogo: '',
                shopAddress: '',
                isActive: true,
            });
        }
    }, [visible]);

    const handleClose = () => {
        reset({
            id: 0,
            shopName: '',
            shopPhone: '',
            shopLogo: '',
            shopAddress: '',
            isActive: true,
        });
        onClose();
    };

    const onSubmitForm = (data: IShopData) => {
        onSubmit(data);
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={handleClose}
        >
            <StatusBar backgroundColor="rgba(0,0,0,0.5)" barStyle="light-content" />
            <View style={styles.modalOverlay}>
                <TouchableWithoutFeedback onPress={handleClose}>
                    <View style={styles.backdrop} />
                </TouchableWithoutFeedback>

                <KeyboardAvoidingView
                    behavior={Platform.OS === "ios" ? "padding" : undefined}
                    style={styles.keyboardAvoidingView}
                >
                    <View style={styles.modalContent}>
                        {/* Drag Handle */}
                        <View style={styles.dragHandleContainer}>
                            <View style={styles.dragHandle} />
                        </View>

                        <Text style={styles.title}>
                            {editData ? 'Cập nhật cửa hàng' : 'Thêm cửa hàng mới'}
                        </Text>

                        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                            <View style={styles.avatarSection}>
                                <Controller
                                    control={control}
                                    name="shopLogo"
                                    render={({ field: { onChange, value } }) => (
                                        <AvatarPicker
                                            value={value}
                                            onChange={onChange}
                                        />
                                    )}
                                />
                            </View>

                            {/* Name Input */}
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Tên cửa hàng <Text style={styles.required}>*</Text></Text>
                                <Controller
                                    control={control}
                                    name="shopName"
                                    rules={{
                                        required: 'Vui lòng nhập tên cửa hàng',
                                        minLength: { value: 2, message: 'Tên phải từ 2 ký tự' }
                                    }}
                                    render={({ field: { onChange, value } }) => (
                                        <View style={[styles.inputContainer, errors.shopName && styles.inputError]}>
                                            <MaterialIcons name="store" size={20} color="#9CA3AF" style={styles.inputIcon} />
                                            <TextInput
                                                style={styles.input}
                                                placeholder="VD: Cơm Tấm Sài Gòn"
                                                value={value}
                                                onChangeText={onChange}
                                                placeholderTextColor="#D1D5DB"
                                            />
                                        </View>
                                    )}
                                />
                                {errors.shopName && <Text style={styles.errorText}>{errors.shopName.message}</Text>}
                            </View>

                            {/* Phone Input */}
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Số điện thoại <Text style={styles.required}>*</Text></Text>
                                <Controller
                                    control={control}
                                    name="shopPhone"
                                    rules={{
                                        required: 'Vui lòng nhập số điện thoại',
                                        pattern: { value: /^[0-9]{10}$/, message: 'Số điện thoại không hợp lệ' }
                                    }}
                                    render={({ field: { onChange, value } }) => (
                                        <View style={[styles.inputContainer, errors.shopPhone && styles.inputError]}>
                                            <MaterialIcons name="phone" size={20} color="#9CA3AF" style={styles.inputIcon} />
                                            <TextInput
                                                style={styles.input}
                                                placeholder="VD: 0901234567"
                                                value={value}
                                                keyboardType="phone-pad"
                                                onChangeText={onChange}
                                                placeholderTextColor="#D1D5DB"
                                            />
                                        </View>
                                    )}
                                />
                                {errors.shopPhone && <Text style={styles.errorText}>{errors.shopPhone.message}</Text>}
                            </View>

                            {/* Address Input */}
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Địa chỉ</Text>
                                <Controller
                                    control={control}
                                    name="shopAddress"
                                    render={({ field: { onChange, value } }) => (
                                        <View style={styles.inputContainer}>
                                            <MaterialIcons name="location-on" size={20} color="#9CA3AF" style={styles.inputIcon} />
                                            <TextInput
                                                style={styles.input}
                                                placeholder="VD: 123 Nguyễn Huệ, Q1"
                                                value={value}
                                                onChangeText={onChange}
                                                placeholderTextColor="#D1D5DB"
                                            />
                                        </View>
                                    )}
                                />
                            </View>

                            <View style={styles.buttonContainer}>
                                <TouchableOpacity style={styles.cancelButton} onPress={handleClose}>
                                    <Text style={styles.cancelButtonText}>Hủy</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.submitButton} onPress={handleSubmit(onSubmitForm)}>
                                    <Text style={styles.submitButtonText}>{editData ? 'Lưu thay đổi' : 'Tạo cửa hàng'}</Text>
                                </TouchableOpacity>
                            </View>
                        </ScrollView>
                    </View>
                </KeyboardAvoidingView>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    backdrop: {
        ...StyleSheet.absoluteFillObject,
    },
    keyboardAvoidingView: {
        width: '100%',
    },
    modalContent: {
        backgroundColor: 'white',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingHorizontal: 24,
        paddingBottom: 30,
        maxHeight: '90%',
        width: '100%',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 10,
    },
    dragHandleContainer: {
        alignItems: 'center',
        paddingVertical: 12,
    },
    dragHandle: {
        width: 40,
        height: 5,
        borderRadius: 3,
        backgroundColor: '#E5E7EB',
    },
    title: {
        fontSize: 22,
        fontWeight: '800',
        color: '#111827',
        textAlign: 'center',
        marginBottom: 20,
    },
    scrollContent: {
        paddingBottom: 20,
    },
    avatarSection: {
        alignItems: 'center',
        marginBottom: 24,
    },
    inputGroup: {
        marginBottom: 16,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 8,
    },
    required: {
        color: '#EF4444',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F9FAFB',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 12,
        paddingHorizontal: 12,
        height: 50,
    },
    inputError: {
        borderColor: '#EF4444',
        backgroundColor: '#FEF2F2',
    },
    inputIcon: {
        marginRight: 10,
    },
    input: {
        flex: 1,
        fontSize: 16,
        color: '#1F2937',
        height: '100%',
    },
    errorText: {
        color: '#EF4444',
        fontSize: 12,
        marginTop: 4,
        marginLeft: 4,
    },
    buttonContainer: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 24,
    },
    cancelButton: {
        flex: 1,
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 12,
        backgroundColor: '#F3F4F6',
    },
    cancelButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#4B5563',
    },
    submitButton: {
        flex: 2,
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 12,
        backgroundColor: '#F97316', // Brand Orange
        shadowColor: "#F97316",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    submitButtonText: {
        fontSize: 16,
        fontWeight: '700',
        color: 'white',
    },
});

export default ShopModal;
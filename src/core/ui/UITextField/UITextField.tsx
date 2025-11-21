import { EInputType } from "@/common/enum";
import { FontAwesome6 } from "@expo/vector-icons";
import React, { useCallback, useMemo, useRef, useState } from "react";
import { Platform, StyleProp, StyleSheet, TextInput, TextStyle, TouchableOpacity, View, ViewStyle } from "react-native";
import { ESize } from "../Helpers";
import { IUITextFieldProps } from "./UITextField.type";

// Define the props interface for the React Native component
function useMergeRefs<T>(
    refs: (React.Ref<T> | React.MutableRefObject<T> | undefined)[]
): React.RefCallback<T> {
    return useCallback((value: T) => {
        refs.forEach((ref) => {
            if (typeof ref === 'function') {
                ref(value);
            } else if (ref != null) {
                (ref as React.MutableRefObject<T>).current = value;
            }
        });
    }, [refs]);
}

const UITextField = React.forwardRef<TextInput, IUITextFieldProps>(
    (props, forwardedRef) => {
        const {
            type = EInputType.TEXT,
            textFieldSize = ESize.M,
            placeholder,
            leftIcon,
            rightIcon,
            clearable = true,
            isFocused: isFocusedProp,
            value,
            isInvalid = false,
            isDisabled,
            className,
            onFocus,
            onBlur,
            onChange, // We'll use onChangeText instead
            onChangeText,
            ...rest
        } = props;

        // Internal ref for operations like clear() and focus()
        const _ref = useRef<TextInput>(null);
        const mergedRef = useMergeRefs([_ref, forwardedRef]);

        // Internal state for focus and password visibility
        const [isFocused, setIsFocused] = useState(isFocusedProp || false);
        const [typeInput, setTypeInput] = useState<EInputType>(type);

        // --- Style Definitions (Translated from Tailwind) ---

        // Size-based padding
        const textFieldSizeStyle: ViewStyle = useMemo(() => {
            switch (textFieldSize) {
                case ESize.XS: return { paddingHorizontal: 4, paddingVertical: 4 };
                case ESize.S: return { paddingHorizontal: 12, paddingVertical: 8 };
                case ESize.M: return { paddingHorizontal: 12, paddingVertical: 12 };
                case ESize.L: return { paddingHorizontal: 10, paddingVertical: 12 };
                case ESize.XL: return { paddingHorizontal: 12, paddingVertical: 12 };
                default: return { paddingHorizontal: 12, paddingVertical: 12 };
            }
        }, [textFieldSize]);

        // State-based styles
        const stateStyle: ViewStyle = useMemo(() => {
            if (isDisabled) {
                return styles.stateDisabled;
            }
            if (isInvalid) {
                return styles.stateError;
            }
            if (isFocused) {
                return styles.stateActive;
            }
            return styles.stateDefault;
        }, [isDisabled, isInvalid, isFocused]);

        // Combine all wrapper styles
        const inputStyleWrapper: StyleProp<ViewStyle> = [
            styles.wrapperBase,
            textFieldSizeStyle,
            stateStyle
        ];

        // Combine all input text styles
        const inputStyle: StyleProp<TextStyle> = [
            styles.inputBase,
            isDisabled ? styles.inputDisabled : {},
        ];

        // --- Event Handlers ---

        const handleFocus = (
            isFocus: boolean,
            event: any, // NativeSyntheticEvent<TextInputFocusEventData>
            callBack?: (event: any) => void
        ) => {
            // Only update if not controlled
            if (isFocusedProp === undefined) {
                setIsFocused(isFocus);
            }
            if (typeof callBack === 'function') {
                callBack(event);
            }
        };

        const handleClear = () => {
            _ref.current?.clear();
            // Manually trigger onChangeText with empty string
            if (onChangeText) {
                onChangeText('');
            }
            // Manually trigger legacy onChange event if provided
            if (onChange) {
                onChange({ nativeEvent: { text: '' } } as any);
            }
            _ref.current?.focus();
        };

        const handleToggleHide = (e: any) => {
            e.preventDefault();
            e.stopPropagation();
            setTypeInput(typeInput === EInputType.PASSWORD ? EInputType.TEXT : EInputType.PASSWORD);
        };

        // --- Right-side Icon Logic ---

        const shouldDisplayClearButton = Boolean(
            ['text', 'email'].includes(type) &&
            value && value.length > 0 &&
            clearable &&
            !isDisabled
        );

        const isShowButtonHide = Boolean(['password'].includes(type));

        const renderRightIcon = () => {
            if (shouldDisplayClearButton) {
                return (
                    <TouchableOpacity onPress={handleClear} style={styles.iconButton}>
                        <FontAwesome6 name="circle-xmark" size={20} color="#6D6E7B" style={{ width: 20, height: 20 }} />
                    </TouchableOpacity>
                );
            }
            if (type === EInputType.PASSWORD) {
                return (
                    <TouchableOpacity
                        onPress={handleToggleHide}
                        style={styles.iconButton}
                    >
                        {typeInput === EInputType.PASSWORD ? (
                            <FontAwesome6
                                name="eye-slash"
                                size={20}
                                color="#6D6E7B"
                                style={{ width: 24, height: 24 }}
                            />
                        ) : (
                            <FontAwesome6
                                name="eye"
                                size={20}
                                color="#6D6E7B"
                                style={{ width: 24, height: 24 }}
                            />
                        )}
                    </TouchableOpacity>
                );
            }
            if (rightIcon) {
                // Wrap custom icon in a View to maintain spacing
                return <View style={styles.iconButton}>{rightIcon}</View>;
            }
            return null;
        };

        return (
            <View style={inputStyleWrapper}>
                {leftIcon && (
                    // The original web component wrapped this in a button.
                    // We'll use TouchableOpacity for consistency, but a View might be better
                    // if it's not interactive.
                    <TouchableOpacity style={styles.iconButton} disabled>
                        {leftIcon}
                    </TouchableOpacity>
                )}
                <TextInput
                    ref={mergedRef}
                    // --- Core Props ---
                    value={value}
                    placeholder={placeholder}
                    placeholderTextColor="#928F8F"
                    editable={!isDisabled}
                    // --- Style & State ---
                    style={inputStyle}
                    // --- Type & Security ---
                    secureTextEntry={typeInput === EInputType.PASSWORD}
                    keyboardType={
                        type === EInputType.EMAIL ? 'email-address' :
                            type === EInputType.NUMBER ? 'numeric' : 'default'
                    }
                    autoCapitalize={type === EInputType.EMAIL ? 'none' : 'sentences'}
                    // --- Event Handlers ---
                    onFocus={(e) => handleFocus(true, e, onFocus)}
                    onBlur={(e) => handleFocus(false, e, onBlur)}
                    onChangeText={onChangeText}
                    // Pass through any other props
                    {...rest}
                />
                {renderRightIcon()}
            </View>
        );
    }
);

// --- StyleSheet ---

const styles = StyleSheet.create({
    // Base wrapper style
    wrapperBase: {
        width: '100%',
        height: 50,
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 10,
        backgroundColor: '#FFFFFF',
        overflow: 'hidden', // Ensures rounded corners apply to children
    },
    // --- Wrapper States ---
    stateDefault: {
        borderWidth: 1,
        borderColor: '#D8D8D8', // Assuming 'border-bgNeutralTonalDisable' is a light gray
    },
    stateActive: {
        backgroundColor: '#FFFFFF',
        borderWidth: 2,
        borderColor: '#007AFF', // Using a standard blue for active, update as needed
    },
    stateError: {
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#ED1A3B',
        // Shadow is platform-specific and harder to replicate exactly
        ...Platform.select({
            ios: {
                shadowColor: 'rgba(255,0,0,0.25)',
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: 1,
                shadowRadius: 8.4,
            },
            android: {
                elevation: 5,
                // Android elevation color is tricky, border is more reliable
            },
        }),
    },
    stateDisabled: {
        backgroundColor: '#EEEEEE',
        borderWidth: 1,
        borderColor: '#D8D8D8',
    },
    // --- Input Element ---
    inputBase: {
        flex: 1, // Take up remaining space
        height: '100%',
        backgroundColor: 'transparent',
        color: '#000000',
        fontSize: 16,
        lineHeight: 24, // React Native uses lineHeight differently, adjust as needed
        fontWeight: '400',
        padding: 0, // Padding is controlled by the wrapper
        margin: 0,
        // 'focus:outline-none' is not needed in React Native
    },
    inputDisabled: {
        color: '#AAAAAA',
    },
    // --- Icons ---
    iconButton: {
        paddingHorizontal: 8, // Give icons some space
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    iconPlaceholder: {
        fontSize: 20,
        color: '#6D6E7B',
    },
});

export { UITextField };


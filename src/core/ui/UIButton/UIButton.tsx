import { useMemo } from "react";
import { ActivityIndicator, StyleProp, StyleSheet, Text, TextStyle, TouchableOpacity, View, ViewStyle } from "react-native";
import { ESize } from "../Helpers";
import { IUIButtonProps } from "./UIButton.type";

const MOCK_COLORS = {
  // 'bg-bgPrimarySolidFocus' (active)
  primaryActive: '#007AFF',
  // 'hover:bg-bgPrimarySolidHover' (no direct equivalent, using for active press)
  primaryHover: '#0056B3',
  // 'bg-bgPrimarySolidDefault' (disabled)
  primaryDisabled: '#AED6F1',
  // '!text-white'
  white: '#FFFFFF',
  // Lighter text for disabled state
  textDisabled: '#E0E0E0',
};

const UIButton: React.FC<IUIButtonProps> = (props) => {
  const {
    children,
    isDisabled,
    isLoading,
    loadingText,
    size = ESize.M,
    style,
    textStyle,
    ...rest
  } = props;

  // 1. Get size-based padding style
  const sizeStyle = useMemo(() => {
    switch (size) {
      case ESize.S: return styles.sizeS;
      case ESize.M: return styles.sizeM;
      case ESize.L: return styles.sizeL;
      case ESize.XL: return styles.sizeXL;
      default: return styles.sizeM;
    }
  }, [size]);

  // A button is disabled if explicitly set or if it's loading
  const finalIsDisabled = isDisabled || isLoading;

  // 2. Combine container styles
  const buttonStyle: StyleProp<ViewStyle> = [
    styles.buttonBase,
    sizeStyle,
    // Apply disabled or default state style
    finalIsDisabled ? styles.stateDisabled : styles.stateDefault,
    style, // Allow external style override
  ];

  // 3. Combine text styles
  const buttonTextStyle: StyleProp<TextStyle> = [
    styles.textBase,
    // Apply disabled or default text color
    finalIsDisabled ? styles.textDisabled : styles.textDefault,
    textStyle, // Allow external text style override
  ];

  // 4. Render the button's content
  const renderContent = () => {
    if (isLoading) {
      return (
        // Use a View to layout loading indicator and text
        <View style={styles.loadingContainer}>
          <ActivityIndicator color={MOCK_COLORS.white} size="small" />
          {loadingText && (
            <Text style={[buttonTextStyle, styles.loadingText]}>
              {loadingText || 'Loading...'}
            </Text>
          )}
        </View>
      );
    }

    // If children are just a string, wrap them in a Text component
    if (typeof children === 'string') {
      return <Text style={buttonTextStyle}>{children}</Text>;
    }

    // If children are custom ReactNode (e.g., an Icon), render directly
    return children;
  };

  return (
    <TouchableOpacity
      disabled={finalIsDisabled}
      style={buttonStyle}
      // Set opacity on press to mimic hover/active state
      activeOpacity={0.7}
      {...rest}
    >
      {renderContent()}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  // Base style from: "flex justify-center items-center rounded-[10px]"
  buttonBase: {
    // Note: 'flex' is not used, as buttons size to content or container
    flexDirection: 'row', // Aligns loading indicator and text
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    borderWidth: 1, // To mimic 'border-transparent'
  },
  // --- Size Styles ---
  sizeS: {
    // 'px-[8px] py-[4px]'
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  sizeM: {
    // 'px-[12px] py-[8px]'
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  sizeL: {
    // 'px-[6px] py-[8px]'
    paddingHorizontal: 6,
    paddingVertical: 8,
  },
  sizeXL: {
    // 'px-[16px] py-[12px]'
    paddingHorizontal: 16,
    paddingVertical: 12,
  },

  // --- State Styles ---
  stateDefault: {
    // 'bg-bgPrimarySolidFocus'
    backgroundColor: MOCK_COLORS.primaryActive,
    borderColor: 'transparent',
  },
  stateDisabled: {
    // 'bg-bgPrimarySolidDefault'
    backgroundColor: MOCK_COLORS.primaryDisabled,
    borderColor: 'transparent',
  },

  // --- Text Base ---
  textBase: {
    fontWeight: '500', // Reasonable default
    fontSize: 16,
  },
  // --- Text States ---
  textDefault: {
    // '!text-white'
    color: MOCK_COLORS.white,
  },
  textDisabled: {
    color: MOCK_COLORS.textDisabled,
  },
  
  // --- Loading ---
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginLeft: 8,
  }
});

export { UIButton };

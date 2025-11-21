import { StyleProp, TextStyle, TouchableOpacityProps, ViewStyle } from "react-native";
import { ESize } from "../Helpers";
export type TUIButtonSize = ESize.S | ESize.M | ESize.L | ESize.XL;
export interface IUIButtonProps extends Omit<TouchableOpacityProps, 'style' | 'disabled'> {
  children: React.ReactNode | string;
  size?: TUIButtonSize;
  isDisabled?: boolean;
  isLoading?: boolean;
  loadingText?: string;
  style?: StyleProp<ViewStyle>; // Style for the button container
  textStyle?: StyleProp<TextStyle>; // Style for the text
}

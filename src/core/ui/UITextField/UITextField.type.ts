import { EInputType } from "@/common/enum";
import { StyleProp, TextInput, TextInputProps, TextStyle, ViewStyle } from "react-native";
import { ESize } from "../Helpers";

export interface IUITextFieldProps extends Omit<TextInputProps, 'disabled' | 'style'> {
  ref?: React.Ref<TextInput>;
  type?: EInputType;
  textFieldSize?: ESize;
  placeholder?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  clearable?: boolean;
  isDisabled?: boolean;
  isInvalid?: boolean;
  isFocused?: boolean;
  value?: string;

  /** style cho container bọc quanh TextInput */
  containerStyle?: StyleProp<ViewStyle>; // ✅ dành cho View bọc ngoài
  /** style cho chính TextInput bên trong */
  inputStyle?: StyleProp<TextStyle>; // ✅ dành riêng cho TextInput
}
import { EMAIL_REGX } from "@/utils";
import { yupResolver } from "@hookform/resolvers/yup";
import React from "react";
import { useForm, UseFormReturn } from "react-hook-form";
import * as yup from "yup";
import { ILoginFormField } from "./LoginForm.type";

// 1. Định nghĩa kiểu dữ liệu cho Context
// Bao gồm mọi thứ từ useForm VÀ trạng thái loading
export type LoginFormContextData = UseFormReturn<ILoginFormField> & {
  isLoading: boolean;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
};

// 2. Tạo Context
export const LoginFormContext = React.createContext({} as LoginFormContextData);

// 3. Tạo Resolver (logic validation)
const useLoginFormResolver = () => {
  const schema = yup.object<ILoginFormField>().shape({
    email: yup
      .string()
      .required("Yêu cầu nhập email của bạn")
      .email("Email không đúng định dạng")
      .matches(EMAIL_REGX, "Email không đúng định dạng")
      .max(100, "Email không được quá 100 ký tự"),
    password: yup
      .string()
      .required("Yêu cầu nhập mật khẩu")
      .max(32, "Giới hạn mật khẩu 32 ký tự"),
  });
  return yupResolver(schema, { abortEarly: false });
};

// 4. Hook cung cấp các phương thức của useForm
export function useLoginFormControlProvider() {
  const resolver = useLoginFormResolver();
  return useForm<ILoginFormField>({
    resolver,
    defaultValues: { email: "", password: "" },
  });
}

// 5. Hook tiện ích để lấy dữ liệu từ Context
export function useLoginFormContext(): LoginFormContextData {
  const context = React.useContext(LoginFormContext);
  if (!context) {
    throw new Error("useLoginFormContext phải được dùng bên trong LoginFormContext.Provider");
  }
  return context;
}
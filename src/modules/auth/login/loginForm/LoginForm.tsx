import { useState } from "react";
// 1. Import KeyboardAvoidingView và Platform
import { KeyboardAvoidingView, Platform, View } from "react-native";
import { LoginFormControl } from "./LoginFormControl";
import { LoginFormContext, useLoginFormControlProvider } from "./useLoginForm";

const LoginForm: React.FC = () => {
    const form = useLoginFormControlProvider();
    const [isLoading, setIsLoading] = useState(false);
    return (
        <LoginFormContext.Provider value={{
            ...form,
            isLoading,
            setIsLoading,
        }}>
            {/* 2. Bọc View của bạn bằng KeyboardAvoidingView */}
            <KeyboardAvoidingView
                // 3. Đặt 'behavior' là 'padding' chỉ khi trên iOS
                behavior={Platform.OS === "ios" ? "padding" : undefined}
                // 4. Thường bạn sẽ cần style={{ flex: 1 }}
                //    để nó hoạt động đúng trong layout
                style={{ flex: 1 }}
            >
                <View>
                    <LoginFormControl.Email />
                    <LoginFormControl.Password />
                    <LoginFormControl.Button />
                </View>
            </KeyboardAvoidingView>
        </LoginFormContext.Provider>
    )
}

export { LoginForm };

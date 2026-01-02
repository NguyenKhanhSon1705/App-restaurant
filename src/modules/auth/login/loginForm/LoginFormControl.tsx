import { EInputType } from "@/common/enum";
import useAppNavigation from "@/common/hooks/useAppNavigation";
import { ESize, UIButton, UITextField } from "@/core/ui";
import { useLoginMutation } from "@/lib/services/modules";
import { Controller } from "react-hook-form";
import { Text, View } from "react-native";
import { ILoginFormField } from "./LoginForm.type";
import { useLoginFormContext } from "./useLoginForm";

const Email = () => {
    const {
        control
    } = useLoginFormContext();
    return (
        <View style={{ marginBottom: 16 }}>
            <Text style={{ marginBottom: 8, fontSize: 14, fontWeight: '600', color: '#374151' }}>
                Email
            </Text>
            <Controller
                control={control}
                name="email"
                render={({ field: { onChange, value }, fieldState: { invalid, error } }) => (
                    <View>
                        <UITextField
                            placeholder="Nhập địa chỉ email"
                            value={value}
                            onChangeText={onChange}
                            type={EInputType.TEXT}
                            textFieldSize={ESize.M}
                            isInvalid={invalid}
                        />
                        {error && <Text style={{ color: "#EF4444", marginTop: 4, fontSize: 12 }}>
                            {error?.message}
                        </Text>}
                    </View>
                )}
            />
        </View>
    );
};


const Password = () => {
    const {
        control,
        formState: { errors },
    } = useLoginFormContext();

    return (
        <View style={{ marginBottom: 24 }}>
            <Text style={{ marginBottom: 8, fontSize: 14, fontWeight: '600', color: '#374151' }}>
                Mật khẩu
            </Text>
            <Controller
                control={control}
                name="password"
                render={({ field: { onChange, value }, fieldState: { invalid, error } }) => (
                    <View>
                        <UITextField
                            placeholder="Nhập mật khẩu"
                            value={value}
                            onChangeText={onChange}
                            type={EInputType.PASSWORD}
                            textFieldSize={ESize.M}
                            isInvalid={invalid}
                        />
                        {error && <Text style={{ color: "#EF4444", marginTop: 4, fontSize: 12 }}>
                            {error?.message}
                        </Text>}
                    </View>
                )}
            />
            {errors.password && <Text style={{ color: "#EF4444", marginTop: 4, fontSize: 12 }}>
                {errors.password?.message}
            </Text>}

        </View>
    );
};


const Button = () => {
    const { isLoading, handleSubmit, setIsLoading } = useLoginFormContext()
    const [login] = useLoginMutation()
    const { goToSwitchRestaurants } = useAppNavigation()
    const onSubmit = async (data: ILoginFormField) => {
        try {
            setIsLoading(true)
            const res = await login({
                email: data.email,
                password: data.password
            }).unwrap()
            console.log(res)
            if (res.isSuccess) {
                goToSwitchRestaurants()
            }
        } catch (err) {
            console.log(err)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <UIButton
            isLoading={isLoading}
            loadingText={"Đang xử lý..."}
            onPress={handleSubmit(onSubmit)}
            className="font-bold text-[16px] mt-2 leading-[24px] outline-none focus:ring-0 text-white tracking-[0.5px] !bg-[#1E3A8A] w-full h-12 lg:h-[48px] rounded-xl shadow-sm"
        >
            Đăng nhập
        </UIButton>
    )
}
const LoginFormControl = { Email, Password, Button }
export { LoginFormControl };


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
        <View>
            <Text style={{ paddingVertical: 4 }}>
                Email
            </Text>
            <Controller
                control={control}
                name="email"
                render={({ field: { onChange, value }, fieldState: { invalid, error } }) => (
                    <View>
                        <UITextField
                            placeholder="Nhập email"
                            value={value}
                            onChangeText={onChange}
                            type={EInputType.TEXT}
                            textFieldSize={ESize.M}
                            isInvalid={invalid}
                        />
                        <Text style={{ color: "#EF4444" }}>
                            {error?.message}
                        </Text>
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
    console.log(errors)
    return (
        <View>
            <Text style={{ paddingVertical: 4 }}>
                Mật khẩu
            </Text>
            <Controller
                control={control}
                name="password"
                render={({ field: { onChange, value }, fieldState: { invalid, error } }) => (
                    <View>
                        <UITextField
                            placeholder="Nhập email"
                            value={value}
                            onChangeText={onChange}
                            type={EInputType.PASSWORD}
                            textFieldSize={ESize.M}
                            isInvalid={invalid}
                        />
                        <Text style={{ color: "#EF4444" }}>
                            {error?.message}
                        </Text>
                    </View>
                )}
            />
            <Text style={{ color: "#EF4444" }}>
                {errors.password?.message}
            </Text>

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
            loadingText={"Đang tải..."}
            onPress={handleSubmit(onSubmit)}
            className="font-semibold text-[14px] mt-4 leading-[20px] lg:leading-[24px] outline-none focus:ring-0 text-white tracking-[0.2em] !bg-[#000] w-full h-10 lg:h-[48px] rounded-full"
        >Đăng nhập
        </UIButton>
    )
}
const LoginFormControl = { Email, Password, Button }
export { LoginFormControl };


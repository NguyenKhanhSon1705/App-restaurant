import { FontAwesome } from "@expo/vector-icons";
import { Platform, Text, TouchableWithoutFeedback, View } from "react-native";
import styled from "styled-components/native";
import { LoginForm } from "./loginForm";

const Container = styled.View`
    position: relative;
    flex: 1;
    width: 100%;
    background-color: #F8FAFC; 
`
const ContainerHead = styled.View`
    height: 45%;
    background-color: #1E3A8A; 
    justify-content: center;
    align-items: center;
    padding-bottom: 50px;
`
const ContainerBody = styled.View`
     position: absolute;
        top: 32%;
        left: 20px;
        right: 20px;
        padding: 30px 24px;
        background-color: #fff;
        border-radius: 20px;
        shadow-color: #64748B;
        shadow-offset: 0px 4px;
        shadow-opacity: 0.1;
        shadow-radius: 12px;
        elevation: 8;
`
const ContainerBodyFooter = styled.View`
    margin-top: 24px;
    align-items: center;
    justify-content: center;
`
const DividerContainer = styled.View`
    flex-direction: row;
    align-items: center;
    width: 100%;
    margin-top: 16px;
    margin-bottom: 20px;
`
const DividerLine = styled.View`
    flex: 1;
    height: 1px;
    background-color: #E2E8F0;
`

const ContainerIcon = styled.View`
    display: flex;
    flex-direction: row;
    gap: 16px;
`
const BoxIcon = styled.TouchableOpacity`
    width: 48px;
    height: 48px;
    border-radius: 24px;
    background-color: #FFF;
    border: 1px solid #E2E8F0;
    align-items: center;
    justify-content: center;
    shadow-color: #000;
    shadow-offset: 0px 2px;
    shadow-opacity: 0.05;
    shadow-radius: 4px;
    elevation: 2;
`
const ContainerLanguage = styled.View`
    position: absolute;
    top: ${Platform.OS === 'ios' ? '40px' : '30px'};
    right: 20px;
    z-index: 1;
`
export function LoginPage() {

    return (
        <TouchableWithoutFeedback >
            <Container>
                <ContainerHead >
                    <View style={{ marginBottom: 12, backgroundColor: 'rgba(255,255,255,0.1)', padding: 16, borderRadius: 20 }}>
                        <FontAwesome name="cube" size={40} color="#BFDBFE" />
                    </View>
                    <Text
                        style={{ color: 'white', fontSize: 26, fontWeight: '700', marginBottom: 8, letterSpacing: 0.5 }}>Chào mừng trở lại</Text>
                    <Text style={{ color: '#BFDBFE', fontSize: 15 }}>Đăng nhập để vào hệ thống quản lý</Text>
                </ContainerHead>
                <ContainerBody>
                    <LoginForm />
                    <ContainerBodyFooter>

                        <DividerContainer>
                            <DividerLine />
                            <Text style={{ marginHorizontal: 16, color: '#94A3B8', fontSize: 13 }}>hoặc đăng nhập với</Text>
                            <DividerLine />
                        </DividerContainer>

                        <ContainerIcon>
                            <BoxIcon>
                                <FontAwesome color={"#3b5998"} name="facebook" size={20}></FontAwesome>
                            </BoxIcon>
                            <BoxIcon>
                                <FontAwesome color={"#DB4437"} name="google" size={20}></FontAwesome>
                            </BoxIcon>
                            <BoxIcon>
                                <FontAwesome color={"#000"} name="apple" size={20}></FontAwesome>
                            </BoxIcon>
                        </ContainerIcon>

                        <Text style={{ marginTop: 24, color: '#64748B', fontSize: 14 }}>
                            Bạn chưa có tài khoản? <Text style={{ fontWeight: '700', color: '#1E3A8A' }}>Đăng ký ngay</Text>
                        </Text>
                    </ContainerBodyFooter>
                </ContainerBody>
            </Container>
        </TouchableWithoutFeedback>
    )
}

export const options = {
    headerShown: false,
};
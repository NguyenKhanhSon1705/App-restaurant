import InnerMyPage from "@/common/InnerMyPage/InnerMyPage";
import { ROUTE } from "@/routers";
import { useRouter } from "expo-router";
import React from "react";
import { Dimensions, StyleSheet } from "react-native";
import styled from "styled-components/native";
import TabbarBottonEven from "./TabbarBottomEven";

// Floating Styled Container
const Container = styled.View`
    position: absolute;
    bottom: 25px; 
    left: 20px;
    right: 20px;
    flex-direction: row;
    background-color: #ffffff;
    padding: 10px 0;
    border-radius: 25px;
    align-items: center;
    justify-content: space-around;
`;

const screenWidth = Dimensions.get("window").width;

const TabBar: React.FC<any> = ({ state, descriptors, navigation }) => {
    const router = useRouter()

    return (
        <InnerMyPage>
            {/* Transparent overlay to catch touches behind if needed, but for floating bar we can just have the bar */}
            <Container style={styles.shadow}>
                {state.routes.map((route: any, index: number) => {
                    const isFocus = state.index === index;
                    const { options } = descriptors[route.key];

                    const onPress = () => {
                        const event = navigation.emit({
                            type: 'tabPress',
                            target: route.key,
                            canPreventDefault: true,
                        });

                        if (!isFocus && !event.defaultPrevented) {
                            if (route.name === 'tables') {
                                router.push(ROUTE.TABLE)
                            }
                            if (route.name === 'areas') {
                                router.push(ROUTE.AREA)
                            }
                            if (route.name === 'settings') {
                                router.push(ROUTE.SETTING)
                            }
                            if (route.name === 'tablearea') {
                                router.push(ROUTE.TABLE_AREA)
                            }
                            if (route.name === 'statistics') {
                                router.push(ROUTE.STATISTICS)
                            }
                        }
                    };

                    return (
                        <TabbarBottonEven
                            routename={route.name}
                            key={route.key}
                            icon={options.title}
                            color={isFocus ? "#F97316" : "#9CA3AF"} // Brand Orange vs Gray
                            label={route.name}
                            isFocused={isFocus}
                            onPress={onPress}
                        />
                    );
                })}
            </Container>
        </InnerMyPage>
    );
};

const styles = StyleSheet.create({
    shadow: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 10,
        elevation: 10, // Android shadow
    }
});

export { TabBar };


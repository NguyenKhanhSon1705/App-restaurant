import { MaterialIcons } from "@expo/vector-icons";
import React, { useEffect, useRef } from "react";
import { Animated, Easing, Pressable, PressableProps, StyleSheet, View } from "react-native";

interface ITabBarBottonProps extends PressableProps {
    label: string,
    routename: string,
    color: string,
    icon?: any,
    isFocused: boolean
}

const TabbarBottonEven: React.FC<ITabBarBottonProps> = ({
    label,
    color,
    routename,
    icon,
    isFocused,
    ...props
}) => {
    const scaleAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        if (isFocused) {
            Animated.timing(scaleAnim, {
                toValue: 1.15,
                duration: 250,
                easing: Easing.out(Easing.back(1.5)),
                useNativeDriver: true,
            }).start();
        } else {
            Animated.timing(scaleAnim, {
                toValue: 1,
                duration: 250,
                easing: Easing.out(Easing.ease),
                useNativeDriver: true,
            }).start();
        }
    }, [isFocused]);

    return (
        <Pressable
            {...props}
            style={styles.container}
        >
            <Animated.View style={[styles.iconWrapper, { transform: [{ scale: scaleAnim }] }]}>
                <MaterialIcons name={icon ?? "grid-view"} size={26} color={color} />
            </Animated.View>

            {isFocused && <View style={[styles.activeDot, { backgroundColor: color }]} />}
        </Pressable>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        height: 60,
    },
    iconWrapper: {
        marginBottom: 4,
    },
    activeDot: {
        width: 4,
        height: 4,
        borderRadius: 2,
        marginTop: 4,
    }
});

export default TabbarBottonEven;
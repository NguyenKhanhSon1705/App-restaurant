import { TabBar } from "@/common/components";
import ROUTE_TABS from "@/routers/route_tabs";
import { Tabs } from "expo-router";
import React from "react";
const _LayoutTabs = () => {
    return (
        <Tabs
            tabBar={(props) => <TabBar {...props} />}
            screenOptions={{ headerShown: false }}
        >
            {
                ROUTE_TABS.map(route => (
                    // <InnerMyPage>
                        <Tabs.Screen
                            key={route.name}
                            name={route.name}
                            options={{
                                title: route.icon,
                            }}
                        />
                    // </InnerMyPage>
                ))
            }
        </Tabs>
    );
};

export default _LayoutTabs;
import ReportBillScreen from "@/modules/report/ReportBillScreen";
import { Stack } from "expo-router";

export default function ReportBillPage() {
    return (
        <>
            <Stack.Screen options={{ headerShown: false }} />
            <ReportBillScreen />
        </>
    );
}

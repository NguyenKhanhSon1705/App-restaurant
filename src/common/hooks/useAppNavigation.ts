import { ROUTE } from "@/routers";
import { useRouter } from "expo-router";

const useAppNavigation = () => {
    const router = useRouter();
    const goToLogin = () => {
        router.push(ROUTE.LOGIN)
    }
    const goToSwitchRestaurants = () => {
        router.push(ROUTE.SWITCH_SHOP)
    }

    // const goToHome = () => {
    //     router.replace(routerApp.home);
    //     router.refresh();
    // };
    return {
        goToLogin,
        goToSwitchRestaurants,
        // goToHome
    }
}

export default useAppNavigation
import { ROUTE } from "@/routers";
import { usePathname, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { getAuthFromStorage } from "../utils";

interface AuthGuardProps {
  children: React.ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthChecked, setIsAuthChecked] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const auth = await getAuthFromStorage();

      const normalize = (p: string) => p.replace(/\/\([^)]+\)/g, '').replace(/\/index$/, '/');
      const normalizedPath = normalize(pathname) || '/';
      const normalizedLoginPath = normalize(ROUTE.LOGIN);

      // Routes that should redirect to dashboard if ALREADY authenticated
      const isPublicRoute = normalizedPath === normalizedLoginPath || normalizedPath === '/';

      if (!auth || !auth.token?.accessToken) {
        if (!isPublicRoute && normalizedPath !== normalizedLoginPath) {
          // console.log("[AuthGuard] Not authenticated, redirecting to LOGIN");
          router.replace(ROUTE.LOGIN);
        } else {
          setIsAuthChecked(true);
        }
      } else {
        if (isPublicRoute) {
          // console.log("[AuthGuard] Already authenticated, redirecting to TABLE_AREA");
          router.replace(ROUTE.TABLE_AREA);
        } else {
          setIsAuthChecked(true);
        }
      }
    };

    checkAuth();
  }, [pathname]);

  // Chỉ render children khi đã kiểm tra auth
  if (!isAuthChecked) return null; // hoặc loading spinner

  return <>{children}</>;
}

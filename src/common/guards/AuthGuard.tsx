import { useAppSelector } from "@/lib/hooks";
import { RootState } from "@/lib/services/store";
import { ROUTE } from "@/routers";
import { usePathname, useRouter } from "expo-router";
import { useEffect, useState } from "react";

interface AuthGuardProps {
  children: React.ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const auth = useAppSelector((state: RootState) => state.auth);
  const [isAuthChecked, setIsAuthChecked] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      const normalize = (p: string) => p.replace(/\/\([^)]+\)/g, '').replace(/\/index$/, '/');
      const normalizedPath = normalize(pathname) || '/';
      const normalizedLoginPath = normalize(ROUTE.LOGIN);

      // Routes that should redirect to dashboard if ALREADY authenticated
      const isPublicRoute = normalizedPath === normalizedLoginPath || normalizedPath === '/';

      const isAuthenticated = !!auth.token?.accessToken;

      if (!isAuthenticated) {
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
  }, [pathname, auth.token.accessToken]);

  // Chỉ render children khi đã kiểm tra auth
  if (!isAuthChecked) return null; // hoặc loading spinner

  return <>{children}</>;
}

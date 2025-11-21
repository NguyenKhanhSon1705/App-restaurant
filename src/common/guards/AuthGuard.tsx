"use client";
import { ROUTE } from "@/routers";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { getAuthFromStorage } from "../utils";

interface AuthGuardProps {
  children: React.ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter();
  const [isAuthChecked, setIsAuthChecked] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const auth = await getAuthFromStorage();
      if (!auth || !auth.token?.accessToken) {
        router.replace(ROUTE.LOGIN);
      } else {
        setIsAuthChecked(true);
      }
    };

    checkAuth();
  }, [router]);

  // Chỉ render children khi đã kiểm tra auth
  if (!isAuthChecked) return null; // hoặc loading spinner

  return <>{children}</>;
}

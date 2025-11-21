import { ROUTE } from '@/routers';
import { useRouter } from 'expo-router';
import React, { ReactNode, useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { getAuthFromStorage, getIdShopFromStorage } from '../utils';

interface GuestGuardProps {
  children: ReactNode;
}

export default function GuestGuard({ children }: GuestGuardProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const auth = await getAuthFromStorage();
      const idShop = await getIdShopFromStorage()
      if(idShop){
        router.replace(ROUTE.TABLE_AREA);
      }else if (auth?.token?.accessToken) {
        router.replace(ROUTE.SWITCH_SHOP);
      }
      setLoading(false);
    };
    checkAuth();
  }, []);

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return <>{children}</>;
}

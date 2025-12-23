'use client';
import Loading from '@/app/loading';
import { useAppSelector } from '@/lib/hooks';
import { useFetchCurrentUserQuery } from '@/lib/services/modules';
import React from 'react';
import { View } from 'react-native';

interface IInnerAppProps {
  children: React.ReactNode;
}

export default function InnerMyPage({ children }: IInnerAppProps) {
  const authState = useAppSelector((state) => state.auth);
  const { isAuthenticated, token } = authState;
  const { isFetching, data} = useFetchCurrentUserQuery(null, {
    // skip: !(isAuthenticated && token.accessToken !== ''),
    // refetchOnMountOrArgChange: true,
  }); 
  if (isFetching || !(isAuthenticated && token.accessToken !== '')) {
    return <Loading />;
  }

  return <View>{children}</View>;
}

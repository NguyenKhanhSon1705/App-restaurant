'use client';
import { useAppSelector } from '@/lib/hooks';
import { useFetchCurrentUserQuery } from '@/lib/services/modules';
import React from 'react';
import { View } from 'react-native';
import { LoadingRotate } from '../components';

interface IInnerAppProps {
  children: React.ReactNode;
}

export default function InnerMain({ children }: IInnerAppProps) {
  const authState = useAppSelector((state) => state.auth);
  const {isFetching } = useFetchCurrentUserQuery(null, { skip: !(authState.isAuthenticated && authState.token) });

  if (isFetching) {
    return <LoadingRotate/>
  }
  return <View>{children}</View>;
}   

'use client';

import React, { type PropsWithChildren, useRef } from 'react';

import { type AppStore, makeStore } from '../services/store';

import { Provider } from 'react-redux';

// biome-ignore lint/complexity/noBannedTypes: <explanation>
const StoreProvider: React.FC<PropsWithChildren<{}>> = ({ children, ...rest}) => {
  const storeRef = useRef<AppStore>(undefined)
  if (!storeRef.current) {
    storeRef.current = makeStore()
  }
  // const {store, props} = wrapper.useWrappedStore(rest); no support for wrapper in next14 yet
  return <Provider store={storeRef.current}>{children}</Provider>;
};

export default StoreProvider;

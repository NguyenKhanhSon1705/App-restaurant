'use client';

import React, { type PropsWithChildren, useRef } from 'react';

import { type AppStore, makeStore, persistor } from '../services/store';

import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';

// biome-ignore lint/complexity/noBannedTypes: <explanation>
const StoreProvider: React.FC<PropsWithChildren<{}>> = ({ children, ...rest }) => {
  const storeRef = useRef<AppStore>(undefined)
  if (!storeRef.current) {
    storeRef.current = makeStore()
  }
  // const {store, props} = wrapper.useWrappedStore(rest); no support for wrapper in next14 yet
  return (
    <Provider store={storeRef.current}>
      <PersistGate loading={null} persistor={persistor}>
        {children}
      </PersistGate>
    </Provider>
  );
};

export default StoreProvider;

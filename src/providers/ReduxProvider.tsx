"use client";

import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { store, persistor } from "@/store/store";
import PersistGateLoading from "@/components/PersistGateLoading";

export function ReduxProvider({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <PersistGate loading={<PersistGateLoading />} persistor={persistor}>
        {children}
      </PersistGate>
    </Provider>
  );
}

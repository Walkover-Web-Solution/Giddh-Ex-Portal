"use client";

import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { usePathname } from "next/navigation";
import { store, persistor } from "@/store/store";
import PersistGateLoading from "@/components/PersistGateLoading";

function ConditionalPersistGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isMagicPage = pathname?.startsWith("/magic");
  const isRootAuthPage = pathname === "/auth";

  if (isMagicPage || isRootAuthPage) {
    return (
      <PersistGate loading={null} persistor={persistor}>
        {children}
      </PersistGate>
    );
  }

  return (
    <PersistGate loading={<PersistGateLoading />} persistor={persistor}>
      {children}
    </PersistGate>
  );
}

export function ReduxProvider({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <ConditionalPersistGate>{children}</ConditionalPersistGate>
    </Provider>
  );
}

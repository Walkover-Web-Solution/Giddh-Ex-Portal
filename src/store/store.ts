import { configureStore } from "@reduxjs/toolkit";
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from "redux-persist";
import storage from "redux-persist/lib/storage";
import autoMergeLevel2 from "redux-persist/lib/stateReconciler/autoMergeLevel2";
import companyReducer, { CompanyState } from "./slices/companySlice";

const companyPersistConfig = {
  key: "companies",
  storage,
  stateReconciler: autoMergeLevel2,
};

const persistedCompanyReducer = persistReducer<CompanyState>(companyPersistConfig, companyReducer);

export const store = configureStore({
  reducer: {
    companies: persistedCompanyReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store);

export type RootState = { companies: CompanyState };
export type AppDispatch = typeof store.dispatch;

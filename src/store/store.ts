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
import counterReducer from "./slices/counterSlice";
import userReducer from "./slices/userSlice";
import companyReducer from "./slices/companySlice";

const companyPersistConfig = {
  key: "companies",
  storage,
  whitelist: ["companies"],
};

const persistedCompanyReducer = persistReducer(companyPersistConfig, companyReducer);

export const store = configureStore({
  reducer: {
    counter: counterReducer,
    user: userReducer,
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

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

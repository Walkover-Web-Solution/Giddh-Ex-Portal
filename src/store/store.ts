import { configureStore } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";
import counterReducer from "./slices/counterSlice";
import userReducer from "./slices/userSlice";
import companyReducer from "./slices/companySlice";

const companyPersistConfig = {
  key: "companies",
  storage,
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
        ignoredActions: ["persist/PERSIST", "persist/REHYDRATE"],
      },
    }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

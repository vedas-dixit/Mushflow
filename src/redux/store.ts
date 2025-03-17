import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./features/authSlice";
import jamReducer from "./features/jamSlice";
import navigationReducer from "./features/navigationSlice";
import loaderReducer from "./features/loaderSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    jam: jamReducer,
    navigation: navigationReducer,
    loader: loaderReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types
        ignoredActions: ['auth/setSession'],
        // Ignore these field paths in all actions
        ignoredActionPaths: ['meta.arg', 'payload.timestamp'],
        // Ignore these paths in the state
        ignoredPaths: ['auth.session'],
      },
    }),
});

// Make the store accessible globally for RTM
if (typeof window !== 'undefined') {
  (window as any).__REDUX_STORE__ = store;
}

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 
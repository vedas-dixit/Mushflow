import { configureStore } from '@reduxjs/toolkit';
import jamReducer from '../features/jamSlice';
import navigationReducer from '../features/navigationSlice';
import authReducer from '../features/authSlice';

export const store = configureStore({
  reducer: {
    jam: jamReducer,
    navigation: navigationReducer,
    auth: authReducer,
    // Add other reducers here as needed
  },
  // Enable Redux DevTools in development
  devTools: process.env.NODE_ENV !== 'production',
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Define the user type
export interface User {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
}

// Define the authentication state
export interface AuthState {
  user: User | null;
  status: 'loading' | 'authenticated' | 'unauthenticated';
  showLoginModal: boolean;
}

// Define the initial state
const initialState: AuthState = {
  user: null,
  status: 'loading',
  showLoginModal: false,
};

// Create the slice
export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Set the user
    setUser: (state, action: PayloadAction<User | null>) => {
      state.user = action.payload;
      state.status = action.payload ? 'authenticated' : 'unauthenticated';
    },
    
    // Set the authentication status
    setStatus: (state, action: PayloadAction<'loading' | 'authenticated' | 'unauthenticated'>) => {
      state.status = action.payload;
    },
    
    // Show the login modal
    showLogin: (state) => {
      state.showLoginModal = true;
    },
    
    // Hide the login modal
    hideLogin: (state) => {
      // Only hide if the user is authenticated
      if (state.status === 'authenticated') {
        state.showLoginModal = false;
      }
    },
  },
});

// Export actions
export const { setUser, setStatus, showLogin, hideLogin } = authSlice.actions;

// Export reducer
export default authSlice.reducer; 
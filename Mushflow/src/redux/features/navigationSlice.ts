import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Define the possible views in the app
export type AppView = 'notes' | 'jam' | 'pinned';

// Define the navigation state
export interface NavigationState {
  currentView: AppView;
  previousView: AppView | null;
}

// Define the initial state
const initialState: NavigationState = {
  currentView: 'notes',
  previousView: null,
};

// Create the slice
export const navigationSlice = createSlice({
  name: 'navigation',
  initialState,
  reducers: {
    // Set the current view
    setCurrentView: (state, action: PayloadAction<AppView>) => {
      state.previousView = state.currentView;
      state.currentView = action.payload;
    },
    
    // Go back to the previous view
    goBack: (state) => {
      if (state.previousView) {
        const temp = state.currentView;
        state.currentView = state.previousView;
        state.previousView = temp;
      }
    },
  },
});

// Export actions
export const { setCurrentView, goBack } = navigationSlice.actions;

// Export reducer
export default navigationSlice.reducer; 
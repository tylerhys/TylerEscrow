// escrowSlice.js
import { createSlice } from '@reduxjs/toolkit';

export const escrowSlice = createSlice({
  name: 'escrows',
  initialState: [],
  reducers: {
    addEscrow: (state, action) => {
      state.push(action.payload);
    },
    setEscrows: (state, action) => {
      return action.payload;
    },
    updateEscrowApprovalStatus: (state, action) => {
      const index = state.findIndex(escrow => escrow.address === action.payload);
      if (index !== -1) {
        state[index].isApproved = true;
      }
    },
  },
});

export const { addEscrow, setEscrows, updateEscrowApprovalStatus } = escrowSlice.actions;

export default escrowSlice.reducer;

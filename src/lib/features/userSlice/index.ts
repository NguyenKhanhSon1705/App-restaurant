import { type PayloadAction, createSlice } from "@reduxjs/toolkit";
import type { IUserState } from "./type";
import type { IUser } from "@/common/types";
import { userApi } from "@/lib/services/modules";

const initialState: IUserState = {
  user: undefined,
};

export const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<IUser>) => {
      state.user = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addMatcher(userApi.endpoints.fetchCurrentUser.matchFulfilled, (state, action: PayloadAction<IUser>) => {
      state.user = action.payload;
    });
  },
});

export const { setUser } = userSlice.actions;
export default userSlice.reducer;
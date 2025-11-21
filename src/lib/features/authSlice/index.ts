// import TokenService from "@/common/utils/tokenService";
import { authApi } from "@/lib/services/modules";
import storage from "@/lib/services/store/cookieStorage";
import { type PayloadAction, createSlice } from "@reduxjs/toolkit";
import type { IAuthState } from "./type";

export const initialAuthState: IAuthState = {
    isAuthenticated: false,
    token: {
        accessToken: "",
        refreshToken: undefined,
    },
};

export const authSlice = createSlice({
    name: "auth",
    initialState: initialAuthState,
    reducers: {
        setAuthenticated: (state, action: PayloadAction<boolean>) => {
            state.isAuthenticated = action.payload;
        },
        setToken: (state, action: PayloadAction<{ accessToken: string }>) => {
            state.token = action.payload;
        },
        setLogout: (state) => {
            state.isAuthenticated = false;
            state.token = { accessToken: "", refreshToken: undefined };
        },
        setCredentials: (state, action: PayloadAction<{ accessToken: string; refreshToken: string }>) => {
            storage.setItem("accessToken", action.payload.refreshToken)
            state.token.accessToken = action.payload.accessToken;
            state.isAuthenticated = true;
            state.token.refreshToken = action.payload.refreshToken;
        },
    },
    extraReducers: (builder) => {
        builder.addMatcher(authApi.endpoints.login.matchFulfilled, (state, action) => {
            state.isAuthenticated = true;
            state.token.accessToken = action.payload.data?.accessToken ?? "";
            state.token.refreshToken = action.payload.data?.refreshToken;
        });
    },
});

export const { setAuthenticated, setToken, setLogout, setCredentials } = authSlice.actions;

export default authSlice.reducer;

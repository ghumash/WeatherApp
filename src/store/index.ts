import { configureStore } from "@reduxjs/toolkit";
import weatherReducer from "./Slices/WeatherSlice";

const store = configureStore({
  reducer: {
    weather: weatherReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;

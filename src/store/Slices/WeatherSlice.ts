import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";
import { appId, hostName } from "../../config/config";

interface CityData {
  main: {
    temp: number;
    feels_like: number;
    temp_min: number;
    temp_max: number;
    pressure: number;
    humidity: number;
  };
  wind: {
    speed: number;
    deg?: number;
  };
  weather: Array<{
    id: number;
    main: string;
    description: string;
    icon: string;
  }>;
  name: string;
}

interface ForecastData {
  list: Array<{
    dt: number;
    main: {
      temp: number;
      feels_like: number;
      temp_min: number;
      temp_max: number;
      pressure: number;
      humidity: number;
    };
    weather: Array<{
      id: number;
      main: string;
      description: string;
      icon: string;
    }>;
    dt_txt: string;
  }>;
}

interface CityRequest {
  city: string;
  unit: string;
}

interface ForecastRequest {
  lat: number;
  lon: number;
  unit: string;
}

export const getCityData = createAsyncThunk<{ data: CityData | null; error: string | null }, CityRequest>(
  "city",
  async (obj) => {
    try {
      const request = await axios.get(
        `${hostName}/data/2.5/weather?q=${obj.city}&units=${obj.unit}&APPID=${appId}`
      );
      const response: CityData = await request.data;
      return {
        data: response,
        error: null,
      };
    } catch (error: any) {
      return {
        data: null,
        error: error.response.data.message,
      };
    }
  }
);

export const get5DaysForecast = createAsyncThunk<ForecastData, ForecastRequest>(
  "5days",
  async (obj) => {
    const request = await axios.get(
      `${hostName}/data/2.5/forecast?lat=${obj.lat}&lon=${obj.lon}&units=${obj.unit}&APPID=${appId}`
    );
    const response: ForecastData = await request.data;
    return response;
  }
);

const weatherSlice = createSlice({
  name: "weather",
  initialState: {
    citySearchLoading: false,
    citySearchData: null as { data: CityData | null; error: string | null } | null,
    forecastLoading: false,
    forecastData: null as ForecastData | null,
    forecastError: null as string | null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getCityData.pending, (state) => {
        state.citySearchLoading = true;
        state.citySearchData = null;
      })
      .addCase(getCityData.fulfilled, (state, action: PayloadAction<{ data: CityData | null; error: string | null }>) => {
        state.citySearchLoading = false;
        state.citySearchData = action.payload;
      })
      .addCase(get5DaysForecast.pending, (state) => {
        state.forecastLoading = true;
        state.forecastData = null;
        state.forecastError = null;
      })
      .addCase(get5DaysForecast.fulfilled, (state, action: PayloadAction<ForecastData>) => {
        state.forecastLoading = false;
        state.forecastData = action.payload;
        state.forecastError = null;
      })
      .addCase(get5DaysForecast.rejected, (state, action) => {
        state.forecastLoading = false;
        state.forecastData = null;
        state.forecastError = action.error.message;
      });
  },
});

export default weatherSlice.reducer;

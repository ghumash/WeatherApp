import { useState, useEffect, ChangeEvent, FormEvent } from "react";
import { useDispatch, useSelector } from "react-redux";
import { get5DaysForecast, getCityData } from "./store/Slices/WeatherSlice";
import { SphereSpinner } from "react-spinners-kit";
import { AppDispatch, RootState } from "./store";

type WeatherData = {
  main: {
    temp: number;
    feels_like: number;
    temp_max: number;
    temp_min: number;
    humidity: number;
    pressure: number;
  };
  weather: { description: string }[];
  wind: {
    speed: number;
  };
  name: string;
};

type ForecastData = {
  dt_txt: string;
  main: {
    temp_max: number;
    temp_min: number;
  };
  weather: { description: string }[];
};

function App() {
  const {
    citySearchLoading,
    citySearchData,
    forecastLoading,
    forecastData,
    forecastError,
  } = useSelector((state: RootState) => state.weather);

  const [loadings, setLoadings] = useState<boolean>(true);
  const [city, setCity] = useState<string>("Yerevan");
  const [unit, setUnit] = useState<"metric" | "imperial">("metric");

  const dispatch = useDispatch<AppDispatch>();

  const allLoadings = [citySearchLoading, forecastLoading];

  useEffect(() => {
    const isAnyChildLoading = allLoadings.some((state) => state);
    setLoadings(isAnyChildLoading);
  }, [allLoadings]);

  const toggleUnit = () => {
    setLoadings(true);
    setUnit((prevUnit) => (prevUnit === "metric" ? "imperial" : "metric"));
  };

  const fetchData = () => {
    dispatch(getCityData({ city, unit })).then((res: any) => {
      if (!res.payload.error) {
        const { lat, lon } = res.payload.data.coord;
        dispatch(get5DaysForecast({ lat, lon, unit }));
      }
    });
  };

  useEffect(() => {
    fetchData();
  }, [unit]);

  const handleCitySearch = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoadings(true);
    fetchData();
  };

  const filterForecastByFirstObjTime = (forecastData?: ForecastData[]) => {
    if (!forecastData) return [];
    const firstObjTime = forecastData[0].dt_txt.split(" ")[1];
    // @ts-ignore
    return forecastData.filter((data) => data.dt_txt.endsWith(firstObjTime));
  };

  const filteredForecast = filterForecastByFirstObjTime(forecastData?.list);

  return (
    <div className="background">
      <div className="box">
        <form autoComplete="off" onSubmit={handleCitySearch}>
          <input
            type="text"
            className="city-input"
            placeholder="Enter City"
            required
            value={city}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setCity(e.target.value)}
            readOnly={loadings}
          />
          <button type="submit">GO</button>
        </form>

        <div className="current-weather-details-box">
          <div className="details-box-header">
            <h4>Current Weather</h4>

            <div className="switch" onClick={toggleUnit}>
              <div className={`switch-toggle ${unit === "metric" ? "c" : "f"}`}></div>
              <span className="c">C</span>
              <span className="f">F</span>
            </div>
          </div>
          {loadings ? (
            <div className="loader">
              <SphereSpinner loadings={loadings} color="#2fa5ed" size={20} />
            </div>
          ) : (
            <>
              {citySearchData && citySearchData.error ? (
                <div>{citySearchData.error}</div>
              ) : (
                <>
                  {forecastError ? (
                    <div>{forecastError}</div>
                  ) : (
                    <>
                      {citySearchData && citySearchData.data ? (
                        <div className="weather-details-container">
                          <div className="details">
                            <h4 className="city-name">{citySearchData.data.name}</h4>

                            <div className="icon-and-temp">
                              <h1>{citySearchData.data.main.temp}&deg;</h1>
                            </div>

                            <h4 className="description">{citySearchData.data.weather[0].description}</h4>
                          </div>

                          <div className="metrices">
                            <h4>
                              Feels like {citySearchData.data.main.feels_like}&deg;C
                            </h4>

                            <div className="key-value-box">
                              <div className="key">
                                <span className="value">
                                  {citySearchData.data.main.temp_max}&deg;C
                                </span>
                              </div>
                              <div className="key">
                                <span className="value">
                                  {citySearchData.data.main.temp_min}&deg;C
                                </span>
                              </div>
                            </div>

                            <div className="key-value-box">
                              <div className="key">
                                <span>Humidity</span>
                              </div>
                              <div className="value">
                                <span>{citySearchData.data.main.humidity}%</span>
                              </div>
                            </div>

                            <div className="key-value-box">
                              <div className="key">
                                <span>Wind</span>
                              </div>
                              <div className="value">
                                <span>{citySearchData.data.wind.speed}kph</span>
                              </div>
                            </div>

                            <div className="key-value-box">
                              <div className="key">
                                <span>Pressure</span>
                              </div>
                              <div className="value">
                                <span>{citySearchData.data.main.pressure}hPa</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div>No Data Found</div>
                      )}
                      {filteredForecast.length > 0 ? (
                        <div className="extended-forecasts-container">
                          {filteredForecast.map((data, index) => {
                            const date = new Date(data.dt_txt);
                            const day = date.toLocaleDateString("en-US", { weekday: "short" });
                            return (
                              <div className="forecast-box" key={index}>
                                <h5>{day}</h5>
                                <h5>{data.weather[0].description}</h5>
                                <h5 className="min-max-temp">
                                  {data.main.temp_max}&deg; / {data.main.temp_min}&deg;
                                </h5>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div>No Data Found</div>
                      )}
                    </>
                  )}
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;

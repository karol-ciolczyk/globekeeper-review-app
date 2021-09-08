import React, { useRef, useEffect, useState } from "react";
import mapboxgl from "!mapbox-gl"; // eslint-disable-line import/no-webpack-loader-syntax

import { countriesData } from "./countriesData";
import style from "./Mapbox.module.css";
import "./general.css";

mapboxgl.accessToken =
  "pk.eyJ1Ijoia2FyY2lvIiwiYSI6ImNrcTd6YjExejAxc3kyb3BrcnBzY252em4ifQ.emytj-LkRX7RcGueM2S9HA";

export const Mapbox = function () {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const europeCountriesData = countriesData.filter((obj) => {
    return obj.timezones[0].toLocaleLowerCase().includes("europe");
  });
  const [currentCoordinates, setCurrentCoordinates] = useState([]);
  const [weather, setWeather] = useState(null);

  const marker = new mapboxgl.Marker({
    color: "tomato",
    draggable: false,
    scale: 0.9,
  });

  const getWeather = function (lat, lon) {
    (async function () {
      try {
        const response = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=77602bfbfc54b2df2996360b627c00ee`
        );
        const data = await response.json();
        console.log(data.main);
        setWeather(data.main);
      } catch (error) {
        console.log(error);
      }
    })();
  };

  const onCountryClickHandler = function (event) {
    marker.remove();
    const countryCode = event.currentTarget.dataset.country;
    const coordinates = europeCountriesData.find((obj) => {
      return (
        obj.country_code.toLocaleLowerCase() === countryCode.toLocaleLowerCase()
      );
    }).latlng;
    setCurrentCoordinates(coordinates);
    getWeather(coordinates[0], coordinates[1]);
  };

  useEffect(() => {
    if (!weather) return;
    map.current.flyTo({
      center: currentCoordinates.reverse(),
      zoom: 6,
    });
    marker
      .setLngLat(currentCoordinates)
      .setPopup(
        new mapboxgl.Popup({ closeOnClick: false }).setHTML(
          `<h4 class="weather">Weather condition: <h4/><p class="conditions"> humidity: ${weather.humidity} 💧<p/><p class="conditions"> temp: ${weather.temp} 🌡️<p/><p class="conditions"> temp max: ${weather.temp_max} 🌡️<p/>
          <p class="conditions"> temp min: ${weather.temp_min} 🌡️<p/>`
        )
      )
      .addTo(map.current);
    marker.togglePopup();

    const markerData = { ...weather, coordinates: currentCoordinates };
    window.localStorage.setItem("marker", JSON.stringify(markerData));
  }, [weather]);

  useEffect(() => {
    if (map.current) return; // initialize map only once
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v11",
      center: [20, 52],
      zoom: 3,
    });
  });

  useEffect(() => {
    const markerData = JSON.parse(localStorage.getItem("marker"));
    console.log(markerData);

    map.current.flyTo({
      center: markerData.coordinates,
      zoom: 7,
    });
    marker
      .setLngLat(markerData.coordinates)
      .setPopup(
        new mapboxgl.Popup({ closeOnClick: false }).setHTML(
          `<h4 class="weather">Weather condition: <h4/><p class="conditions"> humidity: ${markerData.humidity} 💧<p/><p class="conditions"> temp: ${markerData.temp} 🌡️<p/><p class="conditions"> temp max: ${markerData.temp_max} 🌡️<p/>
          <p class="conditions"> temp min: ${markerData.temp_min} 🌡️<p/>`
        )
      )
      .addTo(map.current);
    marker.togglePopup();
  }, []);

  return (
    <div className={style.container}>
      <div className={style.sidebar}>
        <h1 className={style.sidebar__header}> European Countries </h1>
        {europeCountriesData.map((country) => (
          <div
            key={country.country_code}
            data-country={country.country_code}
            className={style.countryData}
            onClick={onCountryClickHandler}
          >
            <h4>{country.name}</h4>
            <div className={style.descriptionContainer}>
              <h5> Coordinates:</h5>
              <p>
                <span> latitude: {country.latlng[0]} </span>
                <span>latitude: {country.latlng[1]} </span>
              </p>
            </div>
          </div>
        ))}
      </div>
      <div ref={mapContainer} className={style["map-container"]} />
    </div>
  );
};

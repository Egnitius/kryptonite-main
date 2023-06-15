import React, { useEffect, useState } from "react";
import "./App.css";
import "./darkmode.css";
import axios from "axios"; // Import axios library
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { library } from "@fortawesome/fontawesome-svg-core";
import { faInfoCircle } from "@fortawesome/free-solid-svg-icons";
import NewsSection from "./News.js";
import { Line, Bar } from "react-chartjs-2";
import "chart.js/auto";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSun, faMoon } from "@fortawesome/free-solid-svg-icons";
import { faStar as solidStar } from "@fortawesome/free-solid-svg-icons";
import { faStar as regularStar } from "@fortawesome/free-regular-svg-icons";

library.add(faInfoCircle);

function App() {
  const [cryptoData, setCryptoData] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredCryptoData, setFilteredCryptoData] = useState([]);
  const [selectedCurrency, setSelectedCurrency] = useState("USD");
  const [selectedCoin, setSelectedCoin] = useState(null);
  const [chartData, setChartData] = useState(null);
  const [chartType, setChartType] = useState("line");
  const [title, setTitle] = useState("");
  const [darkMode, setDarkMode] = useState(false);
  const [favorites, setFavorites] = useState([]);

  const [showFavorites, setShowFavorites] = useState(false);

  const handleSearch = (event) => {
    const query = event.target.value.toLowerCase();
    setSearchQuery(query);

    const filteredData = cryptoData
      .slice(0, 20)
      .filter(
        (coin) =>
          coin.CoinInfo.FullName.toLowerCase().includes(query) ||
          coin.CoinInfo.Name.toLowerCase().includes(query)
      );
    setFilteredCryptoData(filteredData);
  };

  const handleCurrencyChange = (event) => {
    setSelectedCurrency(event.target.value);
  };

  const getCurrencySymbol = (currency) => {
    switch (currency) {
      case "USD":
        return "$";
      case "EUR":
        return "€";
      case "GBP":
        return "£";
      case "JPY":
        return "¥";
      case "ZAR":
        return "R";
      default:
        return "";
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          `https://min-api.cryptocompare.com/data/top/totalvolfull?limit=100&tsym=${selectedCurrency}&api_key=4adeed9b3de5eb507d65f26a9d150cc909328b183d74957dc8a250952ccb8f4a`
        );
        setCryptoData(response.data.Data);
        setFilteredCryptoData(response.data.Data.slice(0, 20));
      } catch (error) {
        console.log(error);
      }
    };

    fetchData();
  }, [selectedCurrency]);

  useEffect(() => {
    // Get the favorites from storage
    const storedFavorites = localStorage.getItem("favorites");

    // Check if there are stored favorites
    if (storedFavorites) {
      const parsedFavorites = JSON.parse(storedFavorites);
      setFavorites(parsedFavorites);
    }
  }, []);

  const fetchChartData = async (coin) => {
    try {
      const response = await axios.get(
        `https://min-api.cryptocompare.com/data/v2/histoday?fsym=${coin.CoinInfo.Name}&tsym=${selectedCurrency}&limit=30&api_key=4adeed9b3de5eb507d65f26a9d150cc909328b183d74957dc8a250952ccb8f4a`
      );
      const data = response.data.Data.Data.slice(-14); // Limit data to last 14 entries
      const labels = data.map((item) => {
        const date = new Date(item.time * 1000);
        return date.toLocaleDateString();
      });
      const prices = data.map((item) => item.close);
      const chartData = {
        labels: labels,
        datasets: [
          {
            label: `${coin.CoinInfo.FullName} Price`,
            data: prices,
            fill: false,
            borderColor: "rgba(75,192,192,1)",
            tension: 0.1,
          },
        ],
      };
      setChartData(chartData);
      setTitle(coin.CoinInfo.FullName);
    } catch (error) {
      console.log(error);
    }
  };

  //toggle dark mode
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  useEffect(() => {
    if (darkMode) {
      document.body.classList.add("dark-mode");
      document.querySelector(".App").classList.add("dark-mode");
    } else {
      document.body.classList.remove("dark-mode");
      document.querySelector(".App").classList.remove("dark-mode");
    }
  }, [darkMode]);

  //toggle favorites
  const toggleFavorite = (coinId) => {
    // Toggle the favorite status
    const isFavorite = favorites.includes(coinId);
    const updatedFavorites = isFavorite
      ? favorites.filter((id) => id !== coinId)
      : [...favorites, coinId];

    // Update the favorites in storage
    localStorage.setItem("favorites", JSON.stringify(updatedFavorites));

    // Update the state
    setFavorites(updatedFavorites);
  };

  const calculatePriceInSelectedCurrency = (coin) => {
    const price =
      coin.RAW &&
      coin.RAW[selectedCurrency] &&
      coin.RAW[selectedCurrency].PRICE;
    if (price !== undefined) {
      return Number(price).toLocaleString(undefined, {
        notation: "compact",
        compactDisplay: "short",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
    }
    return "";
  };

  const calculateMarketCapInSelectedCurrency = (coin) => {
    const marketCap =
      coin.RAW &&
      coin.RAW[selectedCurrency] &&
      coin.RAW[selectedCurrency].MKTCAP;
    if (marketCap !== undefined) {
      return Number(marketCap).toLocaleString(undefined, {
        notation: "compact",
        compactDisplay: "short",
        maximumFractionDigits: 0,
      });
    }
    return "";
  };

  const calculateDirectVolInSelectedCurrency = (coin) => {
    const volume24hTo =
      coin.RAW &&
      coin.RAW[selectedCurrency] &&
      coin.RAW[selectedCurrency].VOLUME24HOURTO;
    if (volume24hTo !== undefined) {
      return Number(volume24hTo).toLocaleString(undefined, {
        notation: "compact",
        compactDisplay: "short",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
    }
    return "";
  };

  const calculateTotalVolInSelectedCurrency = (coin) => {
    const totalVolume24hTo =
      coin.RAW &&
      coin.RAW[selectedCurrency] &&
      coin.RAW[selectedCurrency].TOTALVOLUME24HTO;
    if (totalVolume24hTo !== undefined) {
      return Number(totalVolume24hTo).toLocaleString(undefined, {
        notation: "compact",
        compactDisplay: "short",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
    }
    return "";
  };

  const calculateTopTierVolInSelectedCurrency = (coin) => {
    const totalTopTierVolume24hTo =
      coin.RAW &&
      coin.RAW[selectedCurrency] &&
      coin.RAW[selectedCurrency].TOTALTOPTIERVOLUME24HTO;
    if (totalTopTierVolume24hTo !== undefined) {
      return Number(totalTopTierVolume24hTo).toLocaleString(undefined, {
        notation: "compact",
        compactDisplay: "short",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
    }
    return "";
  };

  const calculateChangeInSelectedCurrency = (coin) => {
    const changeDay =
      coin.RAW &&
      coin.RAW[selectedCurrency] &&
      coin.RAW[selectedCurrency].CHANGEDAY;
    if (changeDay !== undefined) {
      return `${Number(changeDay).toFixed(2)}%`;
    }
    return "";
  };

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 5,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 4000,
  };

  return (
    <div className="App">
      <header>
        <h1 className="Head1">
          {darkMode ? (
            <img src="./logo3-dark.jpeg" alt="Superman Logo" />
          ) : (
            <img src="./logo3.jpeg" alt="Kryptonite Logo" />
          )}
          <span>ryptonite</span>
        </h1>
        <div className="currency-select">
          <label htmlFor="currency">Select Currency: </label>
          <select
            id="currency"
            value={selectedCurrency}
            onChange={handleCurrencyChange}
          >
            <option value="USD">USD</option>
            <option value="EUR">EURO</option>
            <option value="GBP">POUND</option>
            <option value="JPY">Yen</option>
            <option value="ZAR">Rand</option>
          </select>
        </div>
        <button className="favButton" onClick={() => setShowFavorites(true)}>
          Favorites
        </button>

        {showFavorites && (
          <div className="favorites-popup">
            <h2>Favorites</h2>
            {favorites.length === 0 ? (
              <p>No favorites selected.</p>
            ) : (
              favorites.map((coinId) => {
                const coin = cryptoData.find(
                  (coin) => coin.CoinInfo.Id === coinId
                );
                return (
                  <div className="favorite-coin" key={coin.CoinInfo.Id}>
                    <span
                      onClick={() => {
                        setSelectedCoin(coin);
                        fetchChartData(coin);
                      }}
                    >
                      {coin.CoinInfo.FullName}
                    </span>
                    <div className="coin-details">
                      <p>
                        Price: {getCurrencySymbol(selectedCurrency)}
                        {calculatePriceInSelectedCurrency(coin)}
                      </p>

                      <p>
                        Market Cap: {getCurrencySymbol(selectedCurrency)}
                        {calculateMarketCapInSelectedCurrency(coin)}
                      </p>
                    </div>
                    <button
                      onClick={() => toggleFavorite(coin.CoinInfo.Id)}
                      className="remove-button"
                    >
                      Remove
                    </button>
                  </div>
                );
              })
            )}
            <button
              className="closeFav"
              onClick={() => setShowFavorites(false)}
            >
              Close
            </button>
          </div>
        )}
      </header>
      <br></br>
      <main>
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search coin..."
            value={searchQuery}
            onChange={handleSearch}
          />
          <button> Search</button>
        </div>
        <div className="top-five">
          <h2>Top 6 Cryptocurrencies</h2>
          <Slider {...settings}>
            {cryptoData.slice(0, 6).map((coin) => (
              <div className="coin" key={coin.CoinInfo.Id}>
                <img
                  src={`https://cryptocompare.com${coin.CoinInfo.ImageUrl}`}
                  alt={coin.CoinInfo.FullName}
                  className="coin-image"
                  onClick={() => {
                    setSelectedCoin(coin);
                    fetchChartData(coin);
                  }}
                />
                <div className="coin-details">
                  <h3>{coin.CoinInfo.FullName}</h3>
                  <p
                    onClick={() => {
                      setSelectedCoin(coin);
                      fetchChartData(coin);
                    }}
                  >
                    Price: {getCurrencySymbol(selectedCurrency)}
                    {calculatePriceInSelectedCurrency(coin)}
                  </p>
                  <p>
                    Market Cap: {getCurrencySymbol(selectedCurrency)}
                    {calculateMarketCapInSelectedCurrency(coin)}
                  </p>
                </div>
              </div>
            ))}
          </Slider>
          {selectedCoin && (
            <div className="chart-modal">
              <div className="chart-container">
                <button
                  className="close-button"
                  onClick={() => setSelectedCoin(null)}
                >
                  X
                </button>
                {chartData && (
                  <>
                    <div className="chart-type-selector">
                      <label>
                        <input
                          type="radio"
                          name="chartType"
                          value="line"
                          checked={chartType === "line"}
                          onChange={() => setChartType("line")}
                        />
                        Line Chart
                      </label>
                      <label>
                        <input
                          type="radio"
                          name="chartType"
                          value="bar"
                          checked={chartType === "bar"}
                          onChange={() => setChartType("bar")}
                        />
                        Bar Chart
                      </label>
                    </div>
                    <h2 style={{ textAlign: "center" }}>{title}</h2>
                    {chartType === "line" ? (
                      <Line
                        data={chartData}
                        options={{
                          responsive: true,
                          scales: {
                            y: {
                              beginAtZero: true,
                              title: {
                                display: true,
                                text:
                                  "Price " +
                                  getCurrencySymbol(selectedCurrency),
                                font: {
                                  size: 16,
                                  weight: "bold",
                                },
                                color: darkMode ? "white" : "red",
                              },
                              ticks: {
                                font: {
                                  size: 12,
                                  weight: "bold",
                                },
                                color: darkMode ? "white" : "black",
                              },
                            },
                            x: {
                              title: {
                                display: true,
                                text: "Date",
                                font: {
                                  size: 16,
                                  weight: "bold",
                                },
                                color: darkMode ? "white" : "red",
                              },
                              ticks: {
                                font: {
                                  size: 12,
                                  weight: "bold",
                                },
                                color: darkMode ? "white" : "black",
                              },
                            },
                          },
                          plugins: {
                            legend: {
                              display: false, // Hide the legend
                            },
                          },
                          elements: {
                            point: {
                              backgroundColor: "rgba(255, 255, 0, 1)", // Set the point color to yellow
                              borderColor: "rgba(255, 0, 0, 1)", // Set the point border color to red
                              borderWidth: 1, // Set the point border width
                              radius: 4, // Set the point radius
                              hoverRadius: 6, // Set the point hover radius
                            },
                            line: {
                              borderColor: "rgba(50, 50, 255, 1)", // Set the line color to blue
                              borderWidth: 2, // Set the line width
                            },
                          },
                          layout: {
                            padding: {
                              left: 10,
                              right: 10,
                              top: 10,
                              bottom: 30,
                            },
                          },
                          maintainAspectRatio: false, // Allow the chart to resize based on its container
                        }}
                      />
                    ) : (
                      <Bar
                        data={chartData}
                        options={{
                          responsive: true,
                          scales: {
                            y: {
                              beginAtZero: true,
                              title: {
                                display: true,
                                text:
                                  "Price " +
                                  getCurrencySymbol(selectedCurrency),
                                font: {
                                  size: 16,
                                  weight: "bold",
                                },
                                color: darkMode ? "white" : "red",
                              },
                              ticks: {
                                font: {
                                  size: 12,
                                  weight: "bold",
                                },
                                color: darkMode ? "white" : "black",
                              },
                            },
                            x: {
                              title: {
                                display: true,
                                text: "Date",
                                font: {
                                  size: 16,
                                  weight: "bold",
                                },
                                color: darkMode ? "white" : "red",
                              },
                              ticks: {
                                font: {
                                  size: 12,
                                  weight: "bold",
                                },
                                color: darkMode ? "white" : "black",
                              },
                            },
                          },
                          plugins: {
                            legend: {
                              display: false, // Hide the legend
                            },
                          },
                          layout: {
                            padding: {
                              left: 10,
                              right: 10,
                              top: 10,
                              bottom: 30,
                            },
                          },
                          maintainAspectRatio: false, // Allow the chart to resize based on its container
                          barThickness: 20, // Set the width of the bars
                          backgroundColor: "rgba(50, 50, 255, 0.7)", // Set the background color of the bars
                          borderColor: "rgba(50, 50, 255, 1)", // Set the border color of the bars
                          borderWidth: 1, // Set the border width of the bars
                          borderRadius: 5, // Set the border radius of the bars
                        }}
                      />
                    )}
                  </>
                )}
              </div>
            </div>
          )}
        </div>
        <div className="other-cryptos">
          <h2>Other Cryptocurrencies</h2>
          <table>
            <thead>
              <tr>
                <th className="place text-center">ID</th>
                <th>Favorites</th>
                <th className="thumb text-center" colSpan="2">
                  Coin
                </th>
                <th className="price text-center">Price</th>
                <th className="volume">
                  Direct Vol
                  <span className="list-info-icon">
                    <i
                      className="fa fa-info-circle"
                      tooltip-placement="bottom"
                      uib-tooltip="Volume of all markets trading in the selected quote currency, USD by default."
                    ></i>
                  </span>
                </th>
                <th className="full-volume">Total Vol</th>
                <th className="full-volume">
                  Top Tier Vol
                  <span className="list-info-icon">
                    <i
                      className="fa fa-info-circle"
                      tooltip-placement="bottom"
                      uib-tooltip="Volume across all Top-Tier exchanges graded AA-B in the CryptoCompare Exchange Benchmark."
                    ></i>
                  </span>
                </th>
                <th className="market-cap">
                  Market Cap
                  <span className="list-info-icon">
                    <i
                      className="fa fa-info-circle"
                      tooltip-placement="bottom"
                      uib-tooltip="Market Cap = Total Supply * Price. Where Total Supply includes coins held by the project team, locked in smart contracts or escrow. Supply that is verifiably burned is not included. A penalty is applied to coins with low liquidity."
                    ></i>
                  </span>
                </th>
                <th className="change">24h</th>
              </tr>
            </thead>
            <tbody>
              {filteredCryptoData.map((coin) => (
                <tr key={coin.CoinInfo.Id}>
                  <td className="place text-center">{coin.CoinInfo.Id}</td>
                  <td>
                    <FontAwesomeIcon
                      icon={
                        favorites.includes(coin.CoinInfo.Id)
                          ? solidStar
                          : regularStar
                      }
                      className={
                        favorites.includes(coin.CoinInfo.Id)
                          ? "star-gold"
                          : "star-normal"
                      }
                      onClick={() => {
                        toggleFavorite(coin.CoinInfo.Id);
                      }}
                    />
                  </td>
                  <td className="thumb text-center" colSpan="2">
                    <div className="coin-wrapper">
                      <img
                        src={`https://cryptocompare.com${coin.CoinInfo.ImageUrl}`}
                        alt={coin.CoinInfo.FullName}
                        className="coin-image"
                        onClick={() => {
                          setSelectedCoin(coin);
                          fetchChartData(coin);
                        }}
                      />
                      <div className="coin-name">{coin.CoinInfo.FullName}</div>
                    </div>
                  </td>
                  <td className="price text-center">
                    {getCurrencySymbol(selectedCurrency)}
                    {calculatePriceInSelectedCurrency(coin)}
                  </td>
                  <td className="volume">
                    {getCurrencySymbol(selectedCurrency)}
                    {calculateDirectVolInSelectedCurrency(coin)}
                  </td>
                  <td className="full-volume">
                    {getCurrencySymbol(selectedCurrency)}
                    {calculateTotalVolInSelectedCurrency(coin)}
                  </td>
                  <td className="full-volume">
                    {getCurrencySymbol(selectedCurrency)}
                    {calculateTopTierVolInSelectedCurrency(coin)}
                  </td>
                  <td className="market-cap">
                    {getCurrencySymbol(selectedCurrency)}
                    {calculateMarketCapInSelectedCurrency(coin)}
                  </td>
                  <td className="change">
                    {calculateChangeInSelectedCurrency(coin)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="news-section">
          <NewsSection />
        </div>
        <br></br>
      </main>
      <footer>
        <button
          className={darkMode ? "dark-mode-button" : "light-mode-button"}
          onClick={toggleDarkMode}
        >
          {darkMode ? (
            <FontAwesomeIcon icon={faSun} className="icon" />
          ) : (
            <FontAwesomeIcon icon={faMoon} className="icon" />
          )}
          {darkMode ? "" : ""}
        </button>
        <p>&copy; 2023 Kryptonite. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default App;

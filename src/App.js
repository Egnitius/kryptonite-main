import React, { useEffect, useState } from "react";
import "./App.css";
import axios from "axios"; // Import axios library
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { library } from "@fortawesome/fontawesome-svg-core";
import { faInfoCircle } from "@fortawesome/free-solid-svg-icons";
import NewsSection from "./News.js";
import { Line } from "react-chartjs-2";
import "chart.js/auto";
// eslint-disable-next-line
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

library.add(faInfoCircle);

function App() {
  const [cryptoData, setCryptoData] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredCryptoData, setFilteredCryptoData] = useState([]);
  const [selectedCurrency, setSelectedCurrency] = useState("USD");
  const [selectedCoin, setSelectedCoin] = useState(null);
  const [chartData, setChartData] = useState(null);

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

  const fetchChartData = async (coin) => {
    try {
      const response = await axios.get(
        `https://min-api.cryptocompare.com/data/v2/histoday?fsym=${coin.CoinInfo.Name}&tsym=${selectedCurrency}&limit=30&api_key=4adeed9b3de5eb507d65f26a9d150cc909328b183d74957dc8a250952ccb8f4a`
      );
      const data = response.data.Data.Data;
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
    } catch (error) {
      console.log(error);
    }
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
    slidesToShow: 4,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
  };

  return (
    <div className="App">
      <header>
        <h1 className="Head1">Kryptonite</h1>
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
                  Close
                </button>
                {chartData && (
                  <Line
                    data={chartData}
                    options={{
                      responsive: true,
                      scales: {
                        y: {
                          beginAtZero: true,
                          title: {
                            display: true,
                            text: "Price",
                            font: {
                              size: 14,
                              weight: "bold",
                            },
                            color: "red",
                          },
                          ticks: {
                            font: {
                              size: 12,
                              weight: "bold",
                            },
                            color: "blue",
                          },
                        },
                        x: {
                          title: {
                            display: true,
                            text: "Date",
                            font: {
                              size: 14,
                              weight: "bold",
                            },
                            color: "blue",
                          },
                          ticks: {
                            font: {
                              size: 12,
                              weight: "bold",
                            },
                            color: "Black",
                          },
                        },
                      },
                    }}
                  />
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
                  <td className="thumb text-center" colSpan="2">
                    <img
                      src={`https://cryptocompare.com${coin.CoinInfo.ImageUrl}`}
                      alt={coin.CoinInfo.FullName}
                      className="coin-image"
                      onClick={() => {
                        setSelectedCoin(coin);
                        fetchChartData(coin);
                      }}
                    />
                    {coin.CoinInfo.FullName}
                  </td>
                  <td className="price text-center">
                    {getCurrencySymbol(selectedCurrency)}
                    {calculatePriceInSelectedCurrency(coin)}
                  </td>
                  <td className="volume">
                    {getCurrencySymbol(selectedCurrency).VOLUME24HOURTO}
                    {calculateDirectVolInSelectedCurrency(coin)}
                  </td>
                  <td className="full-volume">
                    {getCurrencySymbol(selectedCurrency).TOTALVOLUME24HTO}
                    {calculateTotalVolInSelectedCurrency(coin)}
                  </td>
                  <td className="full-volume">
                    {
                      getCurrencySymbol(selectedCurrency)
                        .TOTALTOPTIERVOLUME24HTO
                    }
                    {calculateTopTierVolInSelectedCurrency(coin)}
                  </td>
                  <td className="market-cap">
                    {getCurrencySymbol(selectedCurrency)}
                    {calculateMarketCapInSelectedCurrency(coin)}
                  </td>
                  <td className="change">
                    {getCurrencySymbol(selectedCurrency).CHANGEDAY}
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
        <p>&copy; 2023 Kryptonite. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default App;

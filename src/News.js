import React, { useEffect, useState } from "react";
import axios from "axios";
import "./App.css";

function NewsSection() {
  const [news, setNews] = useState([]);
  const [selectedArticle, setSelectedArticle] = useState(null);

  const handleArticleClick = (article) => {
    setSelectedArticle(article);
  };

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await axios.get(
          "https://min-api.cryptocompare.com/data/v2/news/?api_key=4adeed9b3de5eb507d65f26a9d150cc909328b183d74957dc8a250952ccb8f4a"
        );
        setNews(response.data.Data);
      } catch (error) {
        console.log(error);
      }
    };

    fetchNews();
  }, []);

  return (
    <div>
      <h2>News Section</h2>

      <div className="news-section">
        {news && news.length > 0 ? (
          news.slice(0, 6).map((article) => (
            <div
              className="news-card"
              key={article.id}
              onClick={() => handleArticleClick(article)}
            >
              <h3>{article.title}</h3>
              <p>{article.description}</p>
            </div>
          ))
        ) : (
          <p>Loading news...</p>
        )}
      </div>

      {selectedArticle && (
        <div className="popup">
          <h3>{selectedArticle.title}</h3>
          <p>{selectedArticle.body}</p>
          <p>Source: {selectedArticle.source_info.name}</p>
          <button onClick={() => setSelectedArticle(null)}>Close</button>
        </div>
      )}
    </div>
  );
}

export default NewsSection;

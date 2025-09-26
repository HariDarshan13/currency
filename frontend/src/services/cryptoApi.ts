export const fetchCryptoData = async () => {
  try {
    const url =
      "https://api.coingecko.com/api/v3/coins/markets" +
      "?vs_currency=usd&order=market_cap_desc&per_page=10&page=1&sparkline=false";

    console.log("Fetching:", url);

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    console.log("Crypto data:", data); // log to browser console
    return data;
  } catch (error) {
    console.error("Error fetching crypto data:", error);
    return [];
  }
};

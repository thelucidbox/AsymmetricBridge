const COINGECKO_BASE = "https://api.coingecko.com/api/v3";

export async function fetchStablecoinData() {
  const params = new URLSearchParams({
    vs_currency: "usd",
    ids: "tether,usd-coin,dai",
    order: "market_cap_desc",
  });

  const response = await fetch(
    `${COINGECKO_BASE}/coins/markets?${params.toString()}`,
  );
  if (!response.ok) {
    throw new Error(`CoinGecko API error: ${response.status}`);
  }

  const coins = await response.json();
  const list = Array.isArray(coins) ? coins : [];

  const totalMarketCap = list.reduce(
    (sum, coin) => sum + (coin.market_cap || 0),
    0,
  );
  const totalVolume = list.reduce(
    (sum, coin) => sum + (coin.total_volume || 0),
    0,
  );

  return {
    coins: list,
    totalMarketCap,
    totalVolume,
    fetchedAt: new Date().toISOString(),
  };
}

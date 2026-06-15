import pandas as pd
import numpy as np
from .config import TICKER_PATHS, UNIVERSE


def load_ticker(ticker: str) -> pd.DataFrame:
    path = TICKER_PATHS[ticker]
    df = pd.read_csv(path, parse_dates=["Date"])
    df = df.sort_values("Date").reset_index(drop=True)
    df = df.rename(columns={"Adj Close": "AdjClose"})
    df["Ticker"] = ticker
    df = df.dropna(subset=["AdjClose", "Volume", "High", "Low", "Close"])
    df = df[df["Volume"] > 0].reset_index(drop=True)
    return df


def load_universe() -> pd.DataFrame:
    frames = []
    for t in UNIVERSE:
        df = load_ticker(t)
        frames.append(df)
    combined = pd.concat(frames, ignore_index=True)
    combined = combined.sort_values(["Ticker", "Date"]).reset_index(drop=True)
    return combined

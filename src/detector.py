import numpy as np
import pandas as pd
from .config import RET_Z_THRESH, VOL_Z_THRESH, RANGE_PCT_THRESH, W_RETURN


def rule_based_flags(df: pd.DataFrame) -> pd.DataFrame:
    """Apply rule-based anomaly detection per stock-day."""
    df = df.copy()
    abs_ret_z = df["ret_z"].abs()
    cond_ret = abs_ret_z > RET_Z_THRESH
    cond_vol = df["vol_z"] > VOL_Z_THRESH
    cond_range = df["range_pct"] > RANGE_PCT_THRESH

    df["anomaly_flag"] = (cond_ret | cond_vol | cond_range).astype(int)

    types = []
    for _, row in df.iterrows():
        labels = []
        if abs(row["ret_z"]) > RET_Z_THRESH:
            if row["ret"] < 0:
                labels.append("crash")
            else:
                labels.append("spike")
        if row["vol_z"] > VOL_Z_THRESH:
            labels.append("volume_shock")
        types.append("+".join(labels) if labels else "")
    df["type"] = types

    reasons = []
    for _, row in df.iterrows():
        r = []
        if abs(row["ret_z"]) > RET_Z_THRESH:
            r.append(f"|ret_z|>{RET_Z_THRESH}")
        if row["vol_z"] > VOL_Z_THRESH:
            r.append(f"vol_z>{VOL_Z_THRESH}")
        if row["range_pct"] > RANGE_PCT_THRESH:
            r.append(f"range_pct>{RANGE_PCT_THRESH}")
        reasons.append("; ".join(r))
    df["why"] = reasons

    return df


def market_context(df: pd.DataFrame) -> pd.DataFrame:
    """Compute market-level daily aggregates."""
    daily = df.groupby("Date").agg(
        market_ret=("ret", "mean"),
        breadth=("ret", lambda x: (x > 0).sum() / len(x)),
        n_tickers=("Ticker", "nunique"),
        n_flagged=("anomaly_flag", "sum"),
    ).reset_index()

    daily["flag_rate"] = daily["n_flagged"] / daily["n_tickers"]

    mkt_ret_abs = daily["market_ret"].abs()
    rolling_pct95 = mkt_ret_abs.rolling(window=W_RETURN, min_periods=W_RETURN).quantile(0.95)
    rolling_pct95 = rolling_pct95.shift(1)

    daily["market_anomaly_flag"] = (
        (mkt_ret_abs > rolling_pct95) | (daily["breadth"] < 0.3)
    ).astype(int)

    daily.loc[rolling_pct95.isna(), "market_anomaly_flag"] = 0

    return daily


def compute_severity(df: pd.DataFrame) -> pd.DataFrame:
    """Compute severity score 0-100 per stock-day."""
    df = df.copy()
    abs_ret_z = df["ret_z"].abs()

    from scipy.stats import percentileofscore as pctof
    arr_ret = abs_ret_z.values
    arr_vol = df["vol_z"].values
    arr_range = df["range_pct"].values

    sev = np.zeros(len(df))
    for i in range(len(df)):
        p1 = pctof(arr_ret, arr_ret[i], kind="rank")
        p2 = pctof(arr_vol, arr_vol[i], kind="rank")
        p3 = arr_range[i] * 100
        sev[i] = (p1 + p2 + p3) / 3.0

    df["severity"] = np.round(sev, 1)
    return df

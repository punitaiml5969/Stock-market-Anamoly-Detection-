import numpy as np
import pandas as pd
from scipy.stats import percentileofscore
from .config import W_RETURN, W_VOLUME, W_RANGE, MIN_OBS


def compute_features(df: pd.DataFrame) -> pd.DataFrame:
    """Compute rolling features per ticker. df must be sorted by Date within each ticker."""
    results = []
    for ticker, grp in df.groupby("Ticker"):
        grp = grp.sort_values("Date").reset_index(drop=True)
        grp["ret"] = grp["AdjClose"].pct_change()
        grp["log_vol"] = np.log1p(grp["Volume"])
        grp["intraday_range"] = (grp["High"] - grp["Low"]) / grp["Close"]

        ret_z = np.full(len(grp), np.nan)
        vol_z = np.full(len(grp), np.nan)
        range_pct = np.full(len(grp), np.nan)

        for i in range(MIN_OBS, len(grp)):
            ret_window = grp["ret"].iloc[i - W_RETURN:i]
            mu_r = ret_window.mean()
            sigma_r = ret_window.std(ddof=1)
            if sigma_r > 1e-12:
                ret_z[i] = (grp["ret"].iloc[i] - mu_r) / sigma_r

            vol_window = grp["log_vol"].iloc[i - W_VOLUME:i]
            mu_v = vol_window.mean()
            sigma_v = vol_window.std(ddof=1)
            if sigma_v > 1e-12:
                vol_z[i] = (grp["log_vol"].iloc[i] - mu_v) / sigma_v

            range_window = grp["intraday_range"].iloc[i - W_RANGE:i].values
            range_pct[i] = percentileofscore(range_window, grp["intraday_range"].iloc[i], kind="rank") / 100.0

        grp["ret_z"] = ret_z
        grp["vol_z"] = vol_z
        grp["range_pct"] = range_pct
        results.append(grp)

    out = pd.concat(results, ignore_index=True)
    out = out.dropna(subset=["ret_z", "vol_z", "range_pct"]).reset_index(drop=True)
    return out

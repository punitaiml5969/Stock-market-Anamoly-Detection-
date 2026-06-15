"""Monthly Mini-Report: summarize abnormal dates for a given month."""
import argparse
import os
import pandas as pd
from .config import OUTPUT_DIR


def monthly_report(month_str: str):
    anomaly_path = os.path.join(OUTPUT_DIR, "daily_anomaly_card.csv")
    market_path = os.path.join(OUTPUT_DIR, "market_day_table.csv")

    if not os.path.exists(anomaly_path):
        print("ERROR: Run walkforward first to generate output CSVs.")
        return

    anomaly = pd.read_csv(anomaly_path)
    market = pd.read_csv(market_path)

    anomaly["month"] = anomaly["date"].str[:7]
    market["month"] = market["date"].str[:7]

    month_anomalies = anomaly[(anomaly["month"] == month_str) & (anomaly["anomaly_flag"] == 1)]
    month_market = market[market["month"] == month_str]

    print(f"\n{'='*80}")
    print(f"  MONTHLY MINI-REPORT: {month_str}")
    print(f"{'='*80}")

    if month_market.empty:
        print(f"  No data for {month_str}.")
        return

    n_days = len(month_market)
    n_anomaly_days = month_market["market_anomaly_flag"].sum()
    print(f"\n  Trading days: {n_days}")
    print(f"  Market anomaly days: {n_anomaly_days}")
    print(f"  Avg market return: {month_market['market_ret'].mean():.4f}")
    print(f"  Avg breadth: {month_market['breadth'].mean():.2f}")

    if month_anomalies.empty:
        print("\n  No stock-level anomalies this month.")
        return

    mkt_flags = market.set_index("date")["market_anomaly_flag"].to_dict()

    print(f"\n  Stock Anomalies: {len(month_anomalies)} events")
    print(f"\n  {'Date':<12} {'Ticker':<8} {'Type':<25} {'ret_z':>7} {'vol_z':>7} {'Mkt flag':>9}  Why")
    print(f"  {'-'*12} {'-'*8} {'-'*25} {'-'*7} {'-'*7} {'-'*9}  {'-'*35}")

    for _, r in month_anomalies.sort_values(["date", "ticker"]).iterrows():
        mkt_f = mkt_flags.get(r["date"], 0)
        print(f"  {r['date']:<12} {r['ticker']:<8} {r['type']:<25} {r['ret_z']:>7.2f} "
              f"{r['vol_z']:>7.2f} {mkt_f:>9}  {r['why']}")

    unique_dates = month_anomalies["date"].nunique()
    top_crashes = month_anomalies[month_anomalies["type"].str.contains("crash", na=False)].nsmallest(3, "ret_z")
    top_spikes = month_anomalies[month_anomalies["type"].str.contains("spike", na=False)].nlargest(3, "ret_z")

    print(f"\n  Summary:")
    print(f"    Unique anomaly dates: {unique_dates}")
    print(f"    Top crashes:")
    for _, r in top_crashes.iterrows():
        print(f"      {r['date']} {r['ticker']}: ret_z={r['ret_z']:.2f}")
    print(f"    Top spikes:")
    for _, r in top_spikes.iterrows():
        print(f"      {r['date']} {r['ticker']}: ret_z={r['ret_z']:.2f}")

    report_df = month_anomalies[["date", "ticker", "type", "ret_z", "vol_z", "range_pct", "why"]].copy()
    report_path = os.path.join(OUTPUT_DIR, f"monthly_report_{month_str}.csv")
    report_df.to_csv(report_path, index=False)
    print(f"\n  Report saved to: {report_path}")
    print()


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--month", type=str, required=True, help="YYYY-MM")
    args = parser.parse_args()
    monthly_report(args.month)


if __name__ == "__main__":
    main()

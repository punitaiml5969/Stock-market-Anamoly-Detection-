"""Date Query: input a date, print market status + anomalous tickers."""
import argparse
import os
import pandas as pd
from .config import OUTPUT_DIR


def query_date(date_str: str):
    anomaly_path = os.path.join(OUTPUT_DIR, "daily_anomaly_card.csv")
    market_path = os.path.join(OUTPUT_DIR, "market_day_table.csv")

    if not os.path.exists(anomaly_path):
        print("ERROR: Run walkforward first to generate output CSVs.")
        return

    anomaly = pd.read_csv(anomaly_path)
    market = pd.read_csv(market_path)

    mkt_row = market[market["date"] == date_str]
    day_data = anomaly[anomaly["date"] == date_str]

    print(f"\n{'='*60}")
    print(f"  DATE QUERY: {date_str}")
    print(f"{'='*60}")

    if mkt_row.empty:
        print(f"  No market data found for {date_str}.")
        print(f"  (Date may be outside the scored range or a non-trading day)")
        return

    row = mkt_row.iloc[0]
    status = "ANOMALOUS" if row["market_anomaly_flag"] == 1 else "NORMAL"
    print(f"\n  Market Status:    {status}")
    print(f"  Market Return:    {row['market_ret']:.4f} ({row['market_ret']*100:.2f}%)")
    print(f"  Breadth:          {row['breadth']:.2f}")
    print(f"  Flag Rate:        {row['flag_rate']:.2f}")

    flagged = day_data[day_data["anomaly_flag"] == 1]
    print(f"\n  Anomalous Tickers ({len(flagged)} of {len(day_data)}):")
    if flagged.empty:
        print("    (none)")
    else:
        print(f"  {'Ticker':<8} {'Type':<25} {'ret':>8} {'ret_z':>8} {'vol_z':>8} {'range_pct':>10} {'severity':>9}  Why")
        print(f"  {'-'*8} {'-'*25} {'-'*8} {'-'*8} {'-'*8} {'-'*10} {'-'*9}  {'-'*30}")
        for _, r in flagged.sort_values("severity", ascending=False).iterrows():
            print(f"  {r['ticker']:<8} {r['type']:<25} {r['ret']:>8.4f} {r['ret_z']:>8.2f} "
                  f"{r['vol_z']:>8.2f} {r['range_pct']:>10.4f} {r['severity']:>9.1f}  {r['why']}")

    km_flagged = day_data[day_data["km_flag"] == 1]
    db_flagged = day_data[day_data["db_flag"] == 1]
    print(f"\n  K-Means flagged:  {len(km_flagged)} tickers")
    for _, r in km_flagged.iterrows():
        print(f"    {r['ticker']:<8} dist={r['km_dist']:.3f}")
    print(f"  DBSCAN flagged:   {len(db_flagged)} tickers")
    for _, r in db_flagged.iterrows():
        print(f"    {r['ticker']:<8}")
    print()


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--date", type=str, required=True, help="YYYY-MM-DD")
    args = parser.parse_args()
    query_date(args.date)


if __name__ == "__main__":
    main()

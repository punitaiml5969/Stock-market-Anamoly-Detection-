"""Main pipeline: load data, compute features, run detectors, produce outputs."""
import argparse
import os
import sys
import numpy as np
import pandas as pd
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from sklearn.metrics import silhouette_score

from .config import OUTPUT_DIR, UNIVERSE
from .data_loader import load_universe
from .features import compute_features
from .detector import rule_based_flags, market_context, compute_severity
from .clustering import (
    split_data, fit_scaler, scale_features, find_best_k,
    fit_kmeans, kmeans_thresholds, kmeans_anomaly_score,
    find_dbscan_eps, dbscan_walk_forward, FEATURE_COLS
)

os.makedirs(OUTPUT_DIR, exist_ok=True)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--universe", type=str, default=",".join(UNIVERSE))
    args = parser.parse_args()

    tickers = [t.strip() for t in args.universe.split(",")]
    print(f"Universe: {tickers}")

    # --- 1. Load & Feature Engineering ---
    print("Loading data...")
    raw = load_universe()
    print(f"  Loaded {len(raw)} rows across {raw['Ticker'].nunique()} tickers")

    print("Computing rolling features (this takes a minute)...")
    feat = compute_features(raw)
    print(f"  Features computed: {len(feat)} scored rows")

    # --- 2. Rule-based detection ---
    print("Running rule-based detector...")
    feat = rule_based_flags(feat)
    feat = compute_severity(feat)
    rule_flagged = feat["anomaly_flag"].sum()
    print(f"  Rule-based flags: {rule_flagged} ({rule_flagged/len(feat)*100:.2f}%)")

    # --- 3. Train/Val/Test split ---
    train, val, test = split_data(feat)
    print(f"  Train: {len(train)}, Val: {len(val)}, Test: {len(test)}")

    # --- 4. Scaling ---
    scaler = fit_scaler(train)
    X_train = scale_features(train, scaler)
    X_val = scale_features(val, scaler)
    X_test = scale_features(test, scaler)

    # --- 5. K-Means ---
    print("Running K-Means elbow/silhouette search...")
    best_k, inertias, sil_scores, k_range = find_best_k(X_train)
    print(f"  Best k={best_k} (silhouette={max(sil_scores):.3f})")

    plt.figure(figsize=(10, 4))
    plt.subplot(1, 2, 1)
    plt.plot(k_range, inertias, "bo-")
    plt.xlabel("k")
    plt.ylabel("Inertia")
    plt.title("Elbow Plot")
    plt.subplot(1, 2, 2)
    plt.plot(k_range, sil_scores, "rs-")
    plt.xlabel("k")
    plt.ylabel("Silhouette Score")
    plt.title("Silhouette Plot")
    plt.tight_layout()
    plt.savefig(os.path.join(OUTPUT_DIR, "kmeans_elbow_silhouette.png"), dpi=150)
    plt.close()

    km = fit_kmeans(X_train, best_k)

    best_q = 97.5
    best_overlap = 0
    for q_try in [95.0, 96.0, 97.0, 97.5, 98.0, 99.0]:
        thresholds = kmeans_thresholds(km, X_train, q=q_try)
        val_flags, val_dists, val_labels = kmeans_anomaly_score(km, thresholds, X_val)
        flag_rate = val_flags.sum() / len(val_flags)
        abs_ret = val["ret"].abs().values
        top5_mask = abs_ret >= np.percentile(abs_ret, 95)
        overlap = (val_flags & top5_mask).sum() / max(top5_mask.sum(), 1)
        if 0.02 <= flag_rate <= 0.08 and overlap > best_overlap:
            best_overlap = overlap
            best_q = q_try
    print(f"  Best quantile threshold: q={best_q}")

    thresholds = kmeans_thresholds(km, X_train, q=best_q)

    for split_name, X_split, split_df in [("train", X_train, train), ("val", X_val, val), ("test", X_test, test)]:
        flags, dists, labels = kmeans_anomaly_score(km, thresholds, X_split)
        split_df = split_df.copy()
        split_df["km_flag"] = flags
        split_df["km_dist"] = dists
        split_df["km_cluster"] = labels
        if split_name == "train":
            train = split_df
        elif split_name == "val":
            val = split_df
        else:
            test = split_df

    km_train_sil = silhouette_score(X_train, km.predict(X_train), sample_size=min(5000, len(X_train)))

    # --- 6. DBSCAN ---
    print("Running DBSCAN...")
    min_samples = 15
    eps, k_dists = find_dbscan_eps(X_train, min_samples)
    print(f"  eps={eps:.3f}, min_samples={min_samples}")

    plt.figure(figsize=(8, 4))
    plt.plot(k_dists)
    plt.axhline(y=eps, color="r", linestyle="--", label=f"eps={eps:.3f}")
    plt.xlabel("Points (sorted)")
    plt.ylabel(f"{min_samples}-NN Distance")
    plt.title("DBSCAN k-distance Plot")
    plt.legend()
    plt.tight_layout()
    plt.savefig(os.path.join(OUTPUT_DIR, "dbscan_kdist.png"), dpi=150)
    plt.close()

    train_flags_db, train_labels_db = dbscan_walk_forward(
        pd.DataFrame(columns=train.columns), train, scaler, eps, min_samples
    )
    train["db_flag"] = train_flags_db
    train["db_label"] = train_labels_db

    val_flags_db, val_labels_db = dbscan_walk_forward(train, val, scaler, eps, min_samples)
    val["db_flag"] = val_flags_db
    val["db_label"] = val_labels_db

    hist_for_test = pd.concat([train, val], ignore_index=True)
    test_flags_db, test_labels_db = dbscan_walk_forward(hist_for_test, test, scaler, eps, min_samples)
    test["db_flag"] = test_flags_db
    test["db_label"] = test_labels_db

    # --- 7. Hybrid consensus ---
    for split_df in [train, val, test]:
        split_df["union_flag"] = ((split_df["km_flag"] == 1) | (split_df["db_flag"] == 1)).astype(int)
        split_df["intersection_flag"] = ((split_df["km_flag"] == 1) & (split_df["db_flag"] == 1)).astype(int)

    # --- 8. Combine all splits ---
    all_data = pd.concat([train, val, test], ignore_index=True)

    # --- 9. Market context ---
    print("Computing market context...")
    mkt = market_context(all_data)

    # --- 10. Outputs ---
    print("Generating output CSVs...")

    anomaly_card = all_data[["Date", "Ticker", "anomaly_flag", "type", "ret", "ret_z", "vol_z",
                             "range_pct", "why", "severity", "km_flag", "km_dist",
                             "db_flag", "union_flag", "intersection_flag"]].copy()
    anomaly_card["date"] = anomaly_card["Date"].dt.strftime("%Y-%m-%d")
    anomaly_card = anomaly_card.drop(columns=["Date"]).rename(columns={"Ticker": "ticker"})
    cols_order = ["date", "ticker", "anomaly_flag", "type", "ret", "ret_z", "vol_z",
                  "range_pct", "severity", "km_flag", "km_dist", "db_flag",
                  "union_flag", "intersection_flag", "why"]
    anomaly_card = anomaly_card[cols_order]
    anomaly_card.to_csv(os.path.join(OUTPUT_DIR, "daily_anomaly_card.csv"), index=False)

    mkt_out = mkt[["Date", "market_ret", "breadth", "market_anomaly_flag", "flag_rate"]].copy()
    mkt_out["date"] = mkt_out["Date"].dt.strftime("%Y-%m-%d")
    mkt_out = mkt_out.drop(columns=["Date"])
    mkt_out = mkt_out[["date", "market_ret", "breadth", "market_anomaly_flag", "flag_rate"]]
    mkt_out.to_csv(os.path.join(OUTPUT_DIR, "market_day_table.csv"), index=False)

    # --- 11. Metrics ---
    print("\n" + "="*70)
    print("METRICS & EVALUATION")
    print("="*70)

    for name, split_df in [("Train (2018)", train), ("Val (2019)", val), ("Test (2020-Q1)", test)]:
        n = len(split_df)
        print(f"\n--- {name} ({n} stock-days) ---")

        for method, col in [("Rule-based", "anomaly_flag"), ("K-Means", "km_flag"),
                            ("DBSCAN", "db_flag"), ("Union", "union_flag"),
                            ("Intersection", "intersection_flag")]:
            flagged = split_df[col].sum()
            rate = flagged / n * 100
            abs_ret = split_df["ret"].abs().values
            top5 = abs_ret >= np.percentile(abs_ret, 95)
            top2 = abs_ret >= np.percentile(abs_ret, 98)
            overlap_5 = (split_df[col].values & top5).sum() / max(top5.sum(), 1) * 100
            overlap_2 = (split_df[col].values & top2).sum() / max(top2.sum(), 1) * 100
            print(f"  {method:20s}: flagged={flagged:5d} ({rate:5.2f}%)  "
                  f"tail_overlap_5%={overlap_5:5.1f}%  tail_overlap_2%={overlap_2:5.1f}%")

    print(f"\nK-Means silhouette (train): {km_train_sil:.4f}")
    print(f"K-Means k={best_k}, quantile threshold q={best_q}")
    print(f"DBSCAN eps={eps:.3f}, min_samples={min_samples}")

    n_clusters_db = len(set(train_labels_db)) - (1 if -1 in train_labels_db else 0)
    noise_rate_db = (train_labels_db == -1).sum() / len(train_labels_db) * 100
    print(f"DBSCAN clusters (train): {n_clusters_db}, noise rate: {noise_rate_db:.1f}%")

    # --- 12. Plots ---
    print("\nGenerating plots...")

    fig, axes = plt.subplots(1, 3, figsize=(18, 5))
    for idx, (name, split_df) in enumerate([("Train", train), ("Val", val), ("Test", test)]):
        ax = axes[idx]
        normal = split_df[split_df["km_flag"] == 0]
        anomaly = split_df[split_df["km_flag"] == 1]
        ax.scatter(normal["ret_z"], normal["vol_z"], s=3, alpha=0.3, label="Normal")
        ax.scatter(anomaly["ret_z"], anomaly["vol_z"], s=15, c="red", alpha=0.7, label="K-Means Anomaly")
        ax.set_xlabel("Return Z-score")
        ax.set_ylabel("Volume Z-score")
        ax.set_title(f"K-Means: {name}")
        ax.legend()
    plt.tight_layout()
    plt.savefig(os.path.join(OUTPUT_DIR, "kmeans_scatter.png"), dpi=150)
    plt.close()

    test_mkt = mkt[mkt["Date"] >= "2020-01-01"].copy()
    if not test_mkt.empty:
        fig, axes = plt.subplots(3, 1, figsize=(14, 10), sharex=True)
        axes[0].plot(test_mkt["Date"], test_mkt["market_ret"], color="blue")
        axes[0].set_ylabel("Market Return")
        axes[0].set_title("Test Period (2020-Q1) Market Dashboard")
        anomaly_dates = test_mkt[test_mkt["market_anomaly_flag"] == 1]["Date"]
        for d in anomaly_dates:
            axes[0].axvline(d, color="red", alpha=0.3, linewidth=0.8)

        axes[1].plot(test_mkt["Date"], test_mkt["breadth"], color="green")
        axes[1].axhline(0.3, color="red", linestyle="--", alpha=0.5)
        axes[1].set_ylabel("Breadth")

        axes[2].bar(test_mkt["Date"], test_mkt["flag_rate"], color="orange", width=1)
        axes[2].set_ylabel("Flag Rate")
        axes[2].set_xlabel("Date")

        plt.tight_layout()
        plt.savefig(os.path.join(OUTPUT_DIR, "test_market_dashboard.png"), dpi=150)
        plt.close()

    fig, ax = plt.subplots(figsize=(10, 5))
    for ticker in all_data["Ticker"].unique():
        tkr = all_data[all_data["Ticker"] == ticker].sort_values("Date")
        ax.plot(tkr["Date"], tkr["ret"].cumsum(), label=ticker, alpha=0.7)
        anom = tkr[tkr["anomaly_flag"] == 1]
        ax.scatter(anom["Date"], anom["ret"].cumsum(), s=20, zorder=5, marker="x")
    ax.set_title("Cumulative Returns with Anomaly Flags (x)")
    ax.set_xlabel("Date")
    ax.set_ylabel("Cumulative Return")
    ax.legend(fontsize=8)
    plt.tight_layout()
    plt.savefig(os.path.join(OUTPUT_DIR, "cumulative_returns_anomalies.png"), dpi=150)
    plt.close()

    print(f"\nAll outputs saved to: {OUTPUT_DIR}")
    print("Done!")


if __name__ == "__main__":
    main()

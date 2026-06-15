import numpy as np
import pandas as pd
from sklearn.preprocessing import StandardScaler
from sklearn.cluster import KMeans, DBSCAN
from sklearn.metrics import silhouette_score
from sklearn.neighbors import NearestNeighbors


FEATURE_COLS = ["ret_z", "vol_z", "range_pct"]


def split_data(df: pd.DataFrame):
    train = df[(df["Date"] >= "2018-01-01") & (df["Date"] <= "2018-12-31")].copy()
    val = df[(df["Date"] >= "2019-01-01") & (df["Date"] <= "2019-12-31")].copy()
    test = df[(df["Date"] >= "2020-01-01") & (df["Date"] <= "2020-03-31")].copy()
    return train, val, test


def fit_scaler(train: pd.DataFrame) -> StandardScaler:
    scaler = StandardScaler()
    scaler.fit(train[FEATURE_COLS].values)
    return scaler


def scale_features(df: pd.DataFrame, scaler: StandardScaler) -> np.ndarray:
    return scaler.transform(df[FEATURE_COLS].values)


def find_best_k(X_train: np.ndarray, k_range=range(2, 11)):
    inertias = []
    sil_scores = []
    for k in k_range:
        km = KMeans(n_clusters=k, random_state=42, n_init=10)
        labels = km.fit_predict(X_train)
        inertias.append(km.inertia_)
        if k >= 2:
            sil_scores.append(silhouette_score(X_train, labels, sample_size=min(5000, len(X_train))))
        else:
            sil_scores.append(0)
    best_idx = np.argmax(sil_scores)
    best_k = list(k_range)[best_idx]
    return best_k, inertias, sil_scores, list(k_range)


def fit_kmeans(X_train: np.ndarray, k: int):
    km = KMeans(n_clusters=k, random_state=42, n_init=10)
    km.fit(X_train)
    return km


def kmeans_thresholds(km, X_train: np.ndarray, q=97.5):
    labels = km.predict(X_train)
    dists = np.linalg.norm(X_train - km.cluster_centers_[labels], axis=1)
    thresholds = {}
    for c in range(km.n_clusters):
        mask = labels == c
        if mask.sum() > 0:
            thresholds[c] = np.percentile(dists[mask], q)
    return thresholds


def kmeans_anomaly_score(km, thresholds, X: np.ndarray):
    labels = km.predict(X)
    dists = np.linalg.norm(X - km.cluster_centers_[labels], axis=1)
    flags = np.array([1 if dists[i] > thresholds.get(labels[i], np.inf) else 0 for i in range(len(X))])
    return flags, dists, labels


def find_dbscan_eps(X_train: np.ndarray, min_samples=15, target_noise_pct=5.0):
    nn = NearestNeighbors(n_neighbors=min_samples)
    nn.fit(X_train)
    distances, _ = nn.kneighbors(X_train)
    k_dists = np.sort(distances[:, -1])

    best_eps = None
    best_diff = float("inf")
    for pct in range(80, 100):
        candidate_eps = np.percentile(k_dists, pct)
        labels = DBSCAN(eps=candidate_eps, min_samples=min_samples).fit_predict(X_train)
        noise_pct = (labels == -1).sum() / len(labels) * 100
        diff = abs(noise_pct - target_noise_pct)
        if diff < best_diff:
            best_diff = diff
            best_eps = candidate_eps
    if best_eps is None:
        best_eps = np.percentile(k_dists, 95)
    return best_eps, k_dists


def fit_dbscan(X: np.ndarray, eps: float, min_samples: int = 15):
    db = DBSCAN(eps=eps, min_samples=min_samples)
    labels = db.fit_predict(X)
    return labels


def dbscan_walk_forward(train_df, new_df, scaler, eps, min_samples=15):
    X_new = scale_features(new_df, scaler)
    if len(train_df) == 0:
        labels_all = fit_dbscan(X_new, eps, min_samples)
        flags = (labels_all == -1).astype(int)
        return flags, labels_all
    X_hist = scale_features(train_df, scaler)
    X_all = np.vstack([X_hist, X_new])
    labels_all = fit_dbscan(X_all, eps, min_samples)
    labels_new = labels_all[len(X_hist):]
    flags = (labels_new == -1).astype(int)
    return flags, labels_new

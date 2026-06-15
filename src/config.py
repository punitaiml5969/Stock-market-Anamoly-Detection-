import os

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(BASE_DIR, "data")
OUTPUT_DIR = os.path.join(BASE_DIR, "output")

UNIVERSE = ["QQQ", "AAPL", "AMZN", "GOOG", "FB", "ADBE", "CSCO"]

TICKER_PATHS = {}
for t in UNIVERSE:
    p = os.path.join(DATA_DIR, "stocks", f"{t}.csv")
    if not os.path.exists(p):
        p = os.path.join(DATA_DIR, "etfs", f"{t}.csv")
    TICKER_PATHS[t] = p

W_RETURN = 63
W_VOLUME = 21
W_RANGE = 63
MIN_OBS = max(W_RETURN, W_VOLUME, W_RANGE)

RET_Z_THRESH = 2.5
VOL_Z_THRESH = 2.5
RANGE_PCT_THRESH = 0.95

TRAIN_START = "2018-01-01"
TRAIN_END = "2018-12-31"
VAL_START = "2019-01-01"
VAL_END = "2019-12-31"
TEST_START = "2020-01-01"
TEST_END = "2020-03-31"

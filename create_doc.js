const fs = require("fs");
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  ImageRun, Header, Footer, AlignmentType, HeadingLevel, BorderStyle,
  WidthType, ShadingType, PageNumber, PageBreak, LevelFormat,
  TableOfContents
} = require("docx");

const OUTPUT_DIR = "C:\\Users\\bhavi\\Downloads\\anamoly detection\\output";

function img(filename, w, h) {
  const p = `${OUTPUT_DIR}\\${filename}`;
  if (!fs.existsSync(p)) return null;
  return new ImageRun({
    type: "png",
    data: fs.readFileSync(p),
    transformation: { width: w, height: h },
    altText: { title: filename, description: filename, name: filename }
  });
}

const border = { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" };
const borders = { top: border, bottom: border, left: border, right: border };
const cellMargins = { top: 60, bottom: 60, left: 100, right: 100 };

function headerCell(text, width) {
  return new TableCell({
    borders,
    width: { size: width, type: WidthType.DXA },
    shading: { fill: "1F4E79", type: ShadingType.CLEAR },
    margins: cellMargins,
    children: [new Paragraph({ children: [new TextRun({ text, bold: true, color: "FFFFFF", font: "Arial", size: 20 })] })]
  });
}

function cell(text, width) {
  return new TableCell({
    borders,
    width: { size: width, type: WidthType.DXA },
    margins: cellMargins,
    children: [new Paragraph({ children: [new TextRun({ text, font: "Arial", size: 20 })] })]
  });
}

const doc = new Document({
  styles: {
    default: { document: { run: { font: "Arial", size: 22 } } },
    paragraphStyles: [
      { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 36, bold: true, font: "Arial", color: "1F4E79" },
        paragraph: { spacing: { before: 360, after: 200 }, outlineLevel: 0 } },
      { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 28, bold: true, font: "Arial", color: "2E75B6" },
        paragraph: { spacing: { before: 240, after: 160 }, outlineLevel: 1 } },
      { id: "Heading3", name: "Heading 3", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 24, bold: true, font: "Arial", color: "404040" },
        paragraph: { spacing: { before: 200, after: 120 }, outlineLevel: 2 } },
    ]
  },
  numbering: {
    config: [
      { reference: "bullets",
        levels: [
          { level: 0, format: LevelFormat.BULLET, text: "•", alignment: AlignmentType.LEFT,
            style: { paragraph: { indent: { left: 720, hanging: 360 } } } },
          { level: 1, format: LevelFormat.BULLET, text: "◦", alignment: AlignmentType.LEFT,
            style: { paragraph: { indent: { left: 1440, hanging: 360 } } } },
        ]
      },
      { reference: "numbers",
        levels: [{ level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 720, hanging: 360 } } } }]
      },
    ]
  },
  sections: [
    // TITLE PAGE
    {
      properties: {
        page: {
          size: { width: 12240, height: 15840 },
          margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 }
        }
      },
      children: [
        new Paragraph({ spacing: { before: 3000 }, children: [] }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 200 },
          children: [new TextRun({ text: "Capstone Project", font: "Arial", size: 52, bold: true, color: "1F4E79" })]
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 400 },
          children: [new TextRun({ text: "Stock Market Anomaly Detection", font: "Arial", size: 40, color: "2E75B6" })]
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          border: { top: { style: BorderStyle.SINGLE, size: 6, color: "2E75B6", space: 1 } },
          spacing: { before: 200, after: 200 },
          children: []
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 100 },
          children: [new TextRun({ text: "Detecting Unusual Market Days Using Rolling Statistics,", font: "Arial", size: 24, color: "666666" })]
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 100 },
          children: [new TextRun({ text: "Rule-Based Detection, K-Means & DBSCAN Clustering", font: "Arial", size: 24, color: "666666" })]
        }),
        new Paragraph({ spacing: { before: 1500 }, children: [] }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [new TextRun({ text: "Universe: QQQ, AAPL, AMZN, GOOG, FB, ADBE, CSCO", font: "Arial", size: 22, color: "888888" })]
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 100 },
          children: [new TextRun({ text: "Dataset: NASDAQ Daily OHLCV (Kaggle)", font: "Arial", size: 22, color: "888888" })]
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [new TextRun({ text: "Train: 2018 | Validation: 2019 | Test: 2020-Q1", font: "Arial", size: 22, color: "888888" })]
        }),
      ]
    },

    // TABLE OF CONTENTS
    {
      properties: {
        page: {
          size: { width: 12240, height: 15840 },
          margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 }
        }
      },
      headers: {
        default: new Header({
          children: [new Paragraph({
            border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: "2E75B6", space: 4 } },
            children: [new TextRun({ text: "Stock Market Anomaly Detection", font: "Arial", size: 18, color: "888888", italics: true })]
          })]
        })
      },
      footers: {
        default: new Footer({
          children: [new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [new TextRun({ text: "Page ", font: "Arial", size: 18, color: "888888" }), new TextRun({ children: [PageNumber.CURRENT], font: "Arial", size: 18, color: "888888" })]
          })]
        })
      },
      children: [
        new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("Table of Contents")] }),
        new TableOfContents("Table of Contents", { hyperlink: true, headingStyleRange: "1-3" }),
        new Paragraph({ children: [new PageBreak()] }),

        // 1. OVERVIEW
        new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("1. Project Overview")] }),
        new Paragraph({ spacing: { after: 120 }, children: [
          new TextRun({ text: "Goal: ", bold: true }),
          new TextRun("Detect unusual market days and stock days using only daily price and volume data. An observation is considered unusual when it shows very large price moves (spikes or crashes), unusually high trading volume, or unusually wide intraday ranges compared to recent history.")
        ]}),
        new Paragraph({ spacing: { after: 120 }, children: [
          new TextRun({ text: "Approach: ", bold: true }),
          new TextRun("This project uses no labels, no news feeds, and no complex deep learning models. Instead, it relies on rolling statistical features and simple unsupervised methods (rule-based thresholds, K-Means, and DBSCAN clustering) to flag anomalies.")
        ]}),
        new Paragraph({ spacing: { after: 120 }, children: [
          new TextRun({ text: "Why This Matters: ", bold: true }),
          new TextRun("Markets frequently experience stress days. Identifying them enables portfolio monitoring (detecting broad market stress), diagnostics (finding individual stocks behaving differently from peers), and learning best practices for time-series analysis without data leakage.")
        ]}),

        new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("1.1 What We Built")] }),
        new Paragraph({ numbering: { reference: "numbers", level: 0 }, children: [
          new TextRun({ text: "Feature Engineering: ", bold: true }),
          new TextRun("Return z-score, volume z-score, and intraday range percentile computed with rolling windows using only past data.")
        ]}),
        new Paragraph({ numbering: { reference: "numbers", level: 0 }, children: [
          new TextRun({ text: "Rule-Based Detector: ", bold: true }),
          new TextRun("If any feature exceeds its threshold, the day is flagged and labeled as crash, spike, or volume_shock.")
        ]}),
        new Paragraph({ numbering: { reference: "numbers", level: 0 }, children: [
          new TextRun({ text: "K-Means Clustering: ", bold: true }),
          new TextRun("Points far from cluster centroids are flagged as anomalies.")
        ]}),
        new Paragraph({ numbering: { reference: "numbers", level: 0 }, children: [
          new TextRun({ text: "DBSCAN Clustering: ", bold: true }),
          new TextRun("Noise points (label = -1) from density-based clustering are flagged.")
        ]}),
        new Paragraph({ numbering: { reference: "numbers", level: 0 }, children: [
          new TextRun({ text: "Date Query: ", bold: true }),
          new TextRun("Input a date, get market status and anomalous tickers.")
        ]}),
        new Paragraph({ numbering: { reference: "numbers", level: 0 }, spacing: { after: 200 }, children: [
          new TextRun({ text: "Monthly Mini-Report: ", bold: true }),
          new TextRun("Summarizes abnormal dates and their causes for any given month.")
        ]}),

        // 2. DATASET
        new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("2. Dataset Description")] }),
        new Paragraph({ spacing: { after: 120 }, children: [
          new TextRun("The dataset comes from Kaggle (NASDAQ Stock Market Dataset) containing daily OHLCV (Open, High, Low, Close, Adj Close, Volume) data for thousands of stocks and ETFs. Data ends on April 1, 2020.")
        ]}),

        new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("2.1 Selected Universe")] }),
        new Table({
          width: { size: 9360, type: WidthType.DXA },
          columnWidths: [2000, 2500, 4860],
          rows: [
            new TableRow({ children: [headerCell("Ticker", 2000), headerCell("Type", 2500), headerCell("Description", 4860)] }),
            new TableRow({ children: [cell("QQQ", 2000), cell("ETF", 2500), cell("NASDAQ-100 Index Tracker (market proxy)", 4860)] }),
            new TableRow({ children: [cell("AAPL", 2000), cell("Stock", 2500), cell("Apple Inc.", 4860)] }),
            new TableRow({ children: [cell("AMZN", 2000), cell("Stock", 2500), cell("Amazon.com Inc.", 4860)] }),
            new TableRow({ children: [cell("GOOG", 2000), cell("Stock", 2500), cell("Alphabet Inc. (Google)", 4860)] }),
            new TableRow({ children: [cell("FB", 2000), cell("Stock", 2500), cell("Meta Platforms (Facebook)", 4860)] }),
            new TableRow({ children: [cell("ADBE", 2000), cell("Stock", 2500), cell("Adobe Inc.", 4860)] }),
            new TableRow({ children: [cell("CSCO", 2000), cell("Stock", 2500), cell("Cisco Systems Inc.", 4860)] }),
          ]
        }),

        new Paragraph({ heading: HeadingLevel.HEADING_2, spacing: { before: 300 }, children: [new TextRun("2.2 Data Columns")] }),
        new Table({
          width: { size: 9360, type: WidthType.DXA },
          columnWidths: [2200, 7160],
          rows: [
            new TableRow({ children: [headerCell("Column", 2200), headerCell("Description", 7160)] }),
            new TableRow({ children: [cell("Date", 2200), cell("Trading date (YYYY-MM-DD)", 7160)] }),
            new TableRow({ children: [cell("Open", 2200), cell("Opening price", 7160)] }),
            new TableRow({ children: [cell("High", 2200), cell("Highest price during the day", 7160)] }),
            new TableRow({ children: [cell("Low", 2200), cell("Lowest price during the day", 7160)] }),
            new TableRow({ children: [cell("Close", 2200), cell("Closing price", 7160)] }),
            new TableRow({ children: [cell("Adj Close", 2200), cell("Adjusted close (accounts for splits/dividends) - used for returns", 7160)] }),
            new TableRow({ children: [cell("Volume", 2200), cell("Number of shares traded", 7160)] }),
          ]
        }),

        new Paragraph({ heading: HeadingLevel.HEADING_2, spacing: { before: 300 }, children: [new TextRun("2.3 Data Splits")] }),
        new Table({
          width: { size: 9360, type: WidthType.DXA },
          columnWidths: [2000, 3000, 4360],
          rows: [
            new TableRow({ children: [headerCell("Split", 2000), headerCell("Period", 3000), headerCell("Purpose", 4360)] }),
            new TableRow({ children: [cell("Train", 2000), cell("2018-01-01 to 2018-12-31", 3000), cell("Fit models, compute thresholds, fit scaler", 4360)] }),
            new TableRow({ children: [cell("Validation", 2000), cell("2019-01-01 to 2019-12-31", 3000), cell("Tune hyperparameters (k, q, eps)", 4360)] }),
            new TableRow({ children: [cell("Test", 2000), cell("2020-01-01 to 2020-03-31", 3000), cell("Locked thresholds, evaluate on COVID crash", 4360)] }),
          ]
        }),
        new Paragraph({ spacing: { before: 120, after: 200 }, children: [
          new TextRun({ text: "After feature computation: ", bold: true }),
          new TextRun("Train = 1,757 stock-days, Validation = 1,764 stock-days, Test = 434 stock-days (total 42,506 scored rows across all time).")
        ]}),

        new Paragraph({ children: [new PageBreak()] }),

        // 3. THEORY & CONCEPTS
        new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("3. Theory & Concepts")] }),

        new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("3.1 What is an Anomaly?")] }),
        new Paragraph({ spacing: { after: 120 }, children: [
          new TextRun("An anomaly is an observation that looks unlikely relative to recent behavior. In financial markets, this means:")
        ]}),
        new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [
          new TextRun({ text: "Point anomaly: ", bold: true }),
          new TextRun("One day that is extreme (e.g., a large crash or spike).")
        ]}),
        new Paragraph({ numbering: { reference: "bullets", level: 0 }, spacing: { after: 120 }, children: [
          new TextRun({ text: "Contextual anomaly: ", bold: true }),
          new TextRun("Extreme relative to context. A 2% move might be normal in volatile months but unusual in calm months.")
        ]}),

        new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("3.2 Rolling Windows & Leakage Prevention")] }),
        new Paragraph({ spacing: { after: 120 }, children: [
          new TextRun({ text: "Rolling window: ", bold: true }),
          new TextRun("When deciding about day t, compute statistics using only days t-1, t-2, ..., t-k. This ensures no future information leaks into the decision.")
        ]}),
        new Paragraph({ spacing: { after: 120 }, children: [
          new TextRun({ text: "Leakage: ", bold: true }),
          new TextRun("Using information from day t or the future to decide about day t. Our design avoids this by strictly using past-only windows.")
        ]}),
        new Paragraph({ spacing: { after: 120 }, children: [
          new TextRun({ text: "Window sizes used: ", bold: true }),
          new TextRun("W_return = 63 trading days (~3 months) for returns, W_volume = 21 days (~1 month) for volume, W_range = 63 days for intraday range.")
        ]}),

        new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("3.3 Z-Scores (Standardized Surprise)")] }),
        new Paragraph({ spacing: { after: 120 }, children: [
          new TextRun("A z-score measures how many standard deviations a value is from the mean. For a rolling window: z_t = (x_t - mean) / std. A z-score of 2.5 means the observation is 2.5 standard deviations from the rolling mean, which is very unusual.")
        ]}),

        new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("3.4 Intraday Range Percentile")] }),
        new Paragraph({ spacing: { after: 120 }, children: [
          new TextRun("The intraday range is (High - Low) / Close. We compute its percentile rank against the previous 63 days. A percentile above 95% means the day had a wider trading range than 95% of recent days.")
        ]}),

        new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("3.5 Market Breadth")] }),
        new Paragraph({ spacing: { after: 200 }, children: [
          new TextRun("Market breadth is the fraction of tickers with positive returns on a given day. Breadth below 0.3 (fewer than 30% of stocks are up) indicates broad market stress. Combined with the mean market return, this gives a daily market status.")
        ]}),

        new Paragraph({ children: [new PageBreak()] }),

        // 4. FEATURE ENGINEERING
        new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("4. Feature Engineering")] }),
        new Paragraph({ spacing: { after: 120 }, children: [
          new TextRun("Three features are computed per stock per day using strictly past data:")
        ]}),

        new Table({
          width: { size: 9360, type: WidthType.DXA },
          columnWidths: [2200, 1800, 5360],
          rows: [
            new TableRow({ children: [headerCell("Feature", 2200), headerCell("Window", 1800), headerCell("Formula & Meaning", 5360)] }),
            new TableRow({ children: [
              cell("ret_z (Return Z-score)", 2200), cell("63 days", 1800),
              cell("z = (r_t - mean(r)) / std(r) over past 63 days. Measures how surprising today's return is.", 5360)
            ]}),
            new TableRow({ children: [
              cell("vol_z (Volume Z-score)", 2200), cell("21 days", 1800),
              cell("z = (log(V_t) - mean(log V)) / std(log V) over past 21 days. Measures volume surprise (log-scale).", 5360)
            ]}),
            new TableRow({ children: [
              cell("range_pct (Range Percentile)", 2200), cell("63 days", 1800),
              cell("Percentile rank of (High-Low)/Close vs past 63 days. Measures how wide the trading range was.", 5360)
            ]}),
          ]
        }),

        new Paragraph({ spacing: { before: 200, after: 200 }, children: [
          new TextRun({ text: "Warm-up rule: ", bold: true }),
          new TextRun("No day is scored until at least 63 past observations exist for that ticker, preventing unreliable statistics from small windows.")
        ]}),

        // 5. DETECTION METHODS
        new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("5. Detection Methods")] }),

        new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("5.1 Rule-Based Detector")] }),
        new Paragraph({ spacing: { after: 100 }, children: [
          new TextRun("A stock-day is flagged as anomalous if any of these conditions hold:")
        ]}),
        new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [
          new TextRun("|ret_z| > 2.5 (extreme return)")
        ]}),
        new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [
          new TextRun("vol_z > 2.5 (extreme volume)")
        ]}),
        new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [
          new TextRun("range_pct > 0.95 (extreme range)")
        ]}),
        new Paragraph({ spacing: { before: 120, after: 100 }, children: [
          new TextRun({ text: "Type labels assigned: ", bold: true })
        ]}),
        new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [
          new TextRun({ text: "crash", bold: true }), new TextRun(": negative return + |ret_z| > 2.5")
        ]}),
        new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [
          new TextRun({ text: "spike", bold: true }), new TextRun(": positive return + |ret_z| > 2.5")
        ]}),
        new Paragraph({ numbering: { reference: "bullets", level: 0 }, spacing: { after: 200 }, children: [
          new TextRun({ text: "volume_shock", bold: true }), new TextRun(": vol_z > 2.5 (can co-exist with crash/spike)")
        ]}),

        new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("5.2 K-Means Anomaly Detection")] }),
        new Paragraph({ spacing: { after: 100 }, children: [
          new TextRun({ text: "Training: ", bold: true }),
          new TextRun("Features are standardized using a StandardScaler fit on the 2018 training set only. K-Means is fit on training data with k chosen via silhouette score (elbow and silhouette plots produced).")
        ]}),
        new Paragraph({ spacing: { after: 100 }, children: [
          new TextRun({ text: "Scoring: ", bold: true }),
          new TextRun("For each point x, compute d(x) = distance to nearest centroid. If d(x) exceeds the q-th percentile threshold for that cluster (computed from training data), flag as anomaly.")
        ]}),
        new Paragraph({ spacing: { after: 200 }, children: [
          new TextRun({ text: "Tuning: ", bold: true }),
          new TextRun("The quantile threshold q is tuned on the 2019 validation set to keep flag rate between 2-8% while maximizing overlap with the top 5% absolute return days. Best k=3, best q=95.0.")
        ]}),

        new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("5.3 DBSCAN Anomaly Detection")] }),
        new Paragraph({ spacing: { after: 100 }, children: [
          new TextRun({ text: "Training: ", bold: true }),
          new TextRun("eps is chosen from the k-distance elbow plot to target approximately 5% noise rate on training data. min_samples = 15.")
        ]}),
        new Paragraph({ spacing: { after: 100 }, children: [
          new TextRun({ text: "Walk-Forward Scoring: ", bold: true }),
          new TextRun("For validation and test sets, DBSCAN is refit on an expanding window (all history up to t-1 plus the new block). Points labeled -1 (noise) are flagged as anomalies.")
        ]}),
        new Paragraph({ spacing: { after: 200 }, children: [
          new TextRun({ text: "Result: ", bold: true }),
          new TextRun("eps = 0.645, min_samples = 15, producing 1 main cluster with ~4.7% noise rate on training data.")
        ]}),

        new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("5.4 Hybrid Consensus")] }),
        new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [
          new TextRun({ text: "Union: ", bold: true }), new TextRun("anomaly if K-Means OR DBSCAN flags (higher recall)")
        ]}),
        new Paragraph({ numbering: { reference: "bullets", level: 0 }, spacing: { after: 200 }, children: [
          new TextRun({ text: "Intersection: ", bold: true }), new TextRun("anomaly if both flag (higher precision)")
        ]}),

        new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("5.5 Market-Level Detection")] }),
        new Paragraph({ spacing: { after: 200 }, children: [
          new TextRun("A market day is flagged as anomalous if: |market_return| exceeds its rolling 95th percentile, OR breadth < 0.3. Additionally, flag_rate (fraction of tickers flagged per day) serves as a market stress indicator.")
        ]}),

        new Paragraph({ children: [new PageBreak()] }),

        // 6. RESULTS & METRICS
        new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("6. Results & Metrics")] }),

        new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("6.1 Model Parameters")] }),
        new Table({
          width: { size: 9360, type: WidthType.DXA },
          columnWidths: [4680, 4680],
          rows: [
            new TableRow({ children: [headerCell("Parameter", 4680), headerCell("Value", 4680)] }),
            new TableRow({ children: [cell("K-Means clusters (k)", 4680), cell("3", 4680)] }),
            new TableRow({ children: [cell("K-Means silhouette score (train)", 4680), cell("0.3568", 4680)] }),
            new TableRow({ children: [cell("K-Means quantile threshold (q)", 4680), cell("95.0", 4680)] }),
            new TableRow({ children: [cell("DBSCAN eps", 4680), cell("0.645", 4680)] }),
            new TableRow({ children: [cell("DBSCAN min_samples", 4680), cell("15", 4680)] }),
            new TableRow({ children: [cell("DBSCAN clusters (train)", 4680), cell("1 main cluster", 4680)] }),
            new TableRow({ children: [cell("DBSCAN noise rate (train)", 4680), cell("4.7%", 4680)] }),
          ]
        }),

        new Paragraph({ heading: HeadingLevel.HEADING_2, spacing: { before: 300 }, children: [new TextRun("6.2 Train Set (2018) - 1,757 stock-days")] }),
        new Table({
          width: { size: 9360, type: WidthType.DXA },
          columnWidths: [2200, 1500, 1400, 2130, 2130],
          rows: [
            new TableRow({ children: [
              headerCell("Method", 2200), headerCell("Flagged", 1500), headerCell("Flag Rate", 1400),
              headerCell("Tail Overlap 5%", 2130), headerCell("Tail Overlap 2%", 2130)
            ]}),
            new TableRow({ children: [cell("Rule-Based", 2200), cell("233", 1500), cell("13.26%", 1400), cell("80.7%", 2130), cell("94.4%", 2130)] }),
            new TableRow({ children: [cell("K-Means", 2200), cell("90", 1500), cell("5.12%", 1400), cell("25.0%", 2130), cell("36.1%", 2130)] }),
            new TableRow({ children: [cell("DBSCAN", 2200), cell("83", 1500), cell("4.72%", 1400), cell("30.7%", 2130), cell("33.3%", 2130)] }),
            new TableRow({ children: [cell("Union", 2200), cell("123", 1500), cell("7.00%", 1400), cell("38.6%", 2130), cell("47.2%", 2130)] }),
            new TableRow({ children: [cell("Intersection", 2200), cell("50", 1500), cell("2.85%", 1400), cell("17.0%", 2130), cell("22.2%", 2130)] }),
          ]
        }),

        new Paragraph({ heading: HeadingLevel.HEADING_2, spacing: { before: 300 }, children: [new TextRun("6.3 Validation Set (2019) - 1,764 stock-days")] }),
        new Table({
          width: { size: 9360, type: WidthType.DXA },
          columnWidths: [2200, 1500, 1400, 2130, 2130],
          rows: [
            new TableRow({ children: [
              headerCell("Method", 2200), headerCell("Flagged", 1500), headerCell("Flag Rate", 1400),
              headerCell("Tail Overlap 5%", 2130), headerCell("Tail Overlap 2%", 2130)
            ]}),
            new TableRow({ children: [cell("Rule-Based", 2200), cell("141", 1500), cell("7.99%", 1400), cell("57.3%", 2130), cell("72.2%", 2130)] }),
            new TableRow({ children: [cell("K-Means", 2200), cell("91", 1500), cell("5.16%", 1400), cell("20.2%", 2130), cell("38.9%", 2130)] }),
            new TableRow({ children: [cell("DBSCAN", 2200), cell("48", 1500), cell("2.72%", 1400), cell("28.1%", 2130), cell("50.0%", 2130)] }),
            new TableRow({ children: [cell("Union", 2200), cell("103", 1500), cell("5.84%", 1400), cell("28.1%", 2130), cell("50.0%", 2130)] }),
            new TableRow({ children: [cell("Intersection", 2200), cell("36", 1500), cell("2.04%", 1400), cell("20.2%", 2130), cell("38.9%", 2130)] }),
          ]
        }),

        new Paragraph({ heading: HeadingLevel.HEADING_2, spacing: { before: 300 }, children: [new TextRun("6.4 Test Set (2020-Q1 / COVID Crash) - 434 stock-days")] }),
        new Table({
          width: { size: 9360, type: WidthType.DXA },
          columnWidths: [2200, 1500, 1400, 2130, 2130],
          rows: [
            new TableRow({ children: [
              headerCell("Method", 2200), headerCell("Flagged", 1500), headerCell("Flag Rate", 1400),
              headerCell("Tail Overlap 5%", 2130), headerCell("Tail Overlap 2%", 2130)
            ]}),
            new TableRow({ children: [cell("Rule-Based", 2200), cell("150", 1500), cell("34.56%", 1400), cell("100.0%", 2130), cell("100.0%", 2130)] }),
            new TableRow({ children: [cell("K-Means", 2200), cell("32", 1500), cell("7.37%", 1400), cell("31.8%", 2130), cell("33.3%", 2130)] }),
            new TableRow({ children: [cell("DBSCAN", 2200), cell("14", 1500), cell("3.23%", 1400), cell("22.7%", 2130), cell("33.3%", 2130)] }),
            new TableRow({ children: [cell("Union", 2200), cell("34", 1500), cell("7.83%", 1400), cell("36.4%", 2130), cell("44.4%", 2130)] }),
            new TableRow({ children: [cell("Intersection", 2200), cell("12", 1500), cell("2.76%", 1400), cell("18.2%", 2130), cell("22.2%", 2130)] }),
          ]
        }),

        new Paragraph({ heading: HeadingLevel.HEADING_2, spacing: { before: 300 }, children: [new TextRun("6.5 Interpretation of Results")] }),
        new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [
          new TextRun({ text: "Rule-Based detector ", bold: true }),
          new TextRun("has the highest tail overlap (catches most extreme days) but also flags the most points. During the COVID crash (2020-Q1), it flags 34.56% of stock-days, reflecting the extreme market conditions where most days were genuinely unusual.")
        ]}),
        new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [
          new TextRun({ text: "K-Means ", bold: true }),
          new TextRun("maintains a controlled flag rate (5-7%) across all splits, with moderate tail overlap. It identifies structurally outlying points in the feature space, catching different types of anomalies than the rule-based approach.")
        ]}),
        new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [
          new TextRun({ text: "DBSCAN ", bold: true }),
          new TextRun("is the most conservative (2-5% flag rate) with strong precision. It excels at finding isolated outliers. During validation, its 2% tail overlap of 50% shows high precision: when it flags, it tends to be correct.")
        ]}),
        new Paragraph({ numbering: { reference: "bullets", level: 0 }, spacing: { after: 200 }, children: [
          new TextRun({ text: "Union/Intersection ", bold: true }),
          new TextRun("provide flexible consensus: union catches more anomalies (higher recall), intersection ensures both methods agree (higher precision).")
        ]}),

        new Paragraph({ children: [new PageBreak()] }),

        // 7. VISUALIZATIONS
        new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("7. Visualizations")] }),

        new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("7.1 K-Means Elbow & Silhouette Analysis")] }),
        new Paragraph({ spacing: { after: 100 }, children: [
          new TextRun("The elbow plot shows inertia decreasing as k increases. The silhouette plot confirms k=3 as optimal, with the highest average silhouette score of 0.357.")
        ]}),
        ...(img("kmeans_elbow_silhouette.png", 580, 230) ? [new Paragraph({ spacing: { after: 200 }, alignment: AlignmentType.CENTER, children: [img("kmeans_elbow_silhouette.png", 580, 230)] })] : []),

        new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("7.2 K-Means Anomaly Scatter Plot")] }),
        new Paragraph({ spacing: { after: 100 }, children: [
          new TextRun("Scatter plots of Return Z-score vs Volume Z-score across Train, Validation, and Test sets. Red points are K-Means anomalies (far from centroids). Note how the test set (2020-Q1) has more extreme points due to COVID volatility.")
        ]}),
        ...(img("kmeans_scatter.png", 580, 180) ? [new Paragraph({ spacing: { after: 200 }, alignment: AlignmentType.CENTER, children: [img("kmeans_scatter.png", 580, 180)] })] : []),

        new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("7.3 DBSCAN k-Distance Plot")] }),
        new Paragraph({ spacing: { after: 100 }, children: [
          new TextRun("The k-distance plot shows the sorted 15-nearest-neighbor distances. The red dashed line marks the chosen eps = 0.645, which targets approximately 5% noise rate.")
        ]}),
        ...(img("dbscan_kdist.png", 500, 230) ? [new Paragraph({ spacing: { after: 200 }, alignment: AlignmentType.CENTER, children: [img("dbscan_kdist.png", 500, 230)] })] : []),

        new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("7.4 Test Period Market Dashboard")] }),
        new Paragraph({ spacing: { after: 100 }, children: [
          new TextRun("Three panels showing the COVID crash period: market returns (with red lines on anomaly dates), breadth (fraction of stocks up, threshold at 0.3), and daily flag rate. The dramatic deterioration in late February and March 2020 is clearly visible.")
        ]}),
        ...(img("test_market_dashboard.png", 560, 380) ? [new Paragraph({ spacing: { after: 200 }, alignment: AlignmentType.CENTER, children: [img("test_market_dashboard.png", 560, 380)] })] : []),

        new Paragraph({ children: [new PageBreak()] }),

        new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("7.5 Cumulative Returns with Anomaly Flags")] }),
        new Paragraph({ spacing: { after: 100 }, children: [
          new TextRun("Cumulative returns for all tickers with X markers on anomaly days. Shows how anomalies cluster around major market moves, especially the COVID crash in early 2020.")
        ]}),
        ...(img("cumulative_returns_anomalies.png", 560, 300) ? [new Paragraph({ spacing: { after: 200 }, alignment: AlignmentType.CENTER, children: [img("cumulative_returns_anomalies.png", 560, 300)] })] : []),

        new Paragraph({ children: [new PageBreak()] }),

        // 8. CASE STUDIES
        new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("8. Case Studies")] }),

        new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("8.1 February 27, 2020 - Market-Wide Crash")] }),
        new Paragraph({ spacing: { after: 100 }, children: [
          new TextRun("This was one of the worst days during the initial COVID sell-off. Market return was -4.93% with breadth at 0.00 (zero tickers had positive returns). All 7 tickers were flagged by the rule-based detector:")
        ]}),
        new Table({
          width: { size: 9360, type: WidthType.DXA },
          columnWidths: [1300, 2800, 1400, 1400, 2460],
          rows: [
            new TableRow({ children: [headerCell("Ticker", 1300), headerCell("Type", 2800), headerCell("ret_z", 1400), headerCell("vol_z", 1400), headerCell("Severity", 2460)] }),
            new TableRow({ children: [cell("QQQ", 1300), cell("crash + volume_shock", 2800), cell("-4.98", 1400), cell("2.58", 1400), cell("98.9", 2460)] }),
            new TableRow({ children: [cell("CSCO", 1300), cell("crash", 2800), cell("-3.18", 1400), cell("2.05", 1400), cell("97.8", 2460)] }),
            new TableRow({ children: [cell("AAPL", 1300), cell("crash + volume_shock", 2800), cell("-4.13", 1400), cell("2.68", 1400), cell("97.8", 2460)] }),
            new TableRow({ children: [cell("ADBE", 1300), cell("crash", 2800), cell("-3.33", 1400), cell("2.19", 1400), cell("97.6", 2460)] }),
            new TableRow({ children: [cell("GOOG", 1300), cell("crash", 2800), cell("-4.34", 1400), cell("1.49", 1400), cell("96.6", 2460)] }),
            new TableRow({ children: [cell("AMZN", 1300), cell("crash", 2800), cell("-3.16", 1400), cell("1.38", 1400), cell("95.9", 2460)] }),
          ]
        }),

        new Paragraph({ heading: HeadingLevel.HEADING_2, spacing: { before: 300 }, children: [new TextRun("8.2 March 16, 2020 - Black Monday")] }),
        new Paragraph({ spacing: { after: 100 }, children: [
          new TextRun("The worst single day in the test period with market return of -11.54% and breadth at 0.00. All tickers experienced extreme crashes, with FB dropping 14.25% (ret_z = -4.88). Severity scores ranged from 87 to 97, confirming truly exceptional market stress.")
        ]}),

        new Paragraph({ heading: HeadingLevel.HEADING_2, spacing: { before: 300 }, children: [new TextRun("8.3 March 2020 Summary")] }),
        new Paragraph({ spacing: { after: 200 }, children: [
          new TextRun("March 2020 had 17 out of 22 trading days flagged as market anomalies, with 78 individual stock anomaly events. The top crashes included ADBE (ret_z = -5.36 on March 9), FB (ret_z = -4.88 on March 16), and QQQ (ret_z = -4.66 on March 16). Notable bounce-back spikes occurred on March 13 (ADBE +6.47 ret_z) and March 2 (AAPL +5.07 ret_z).")
        ]}),

        // 9. PROJECT STRUCTURE
        new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("9. Project Structure & How to Run")] }),

        new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("9.1 Directory Layout")] }),
        new Paragraph({ spacing: { after: 100 }, children: [new TextRun({ text: "anamoly detection/", font: "Courier New", size: 20 })] }),
        new Paragraph({ spacing: { after: 40 }, children: [new TextRun({ text: "  data/stocks/       - Individual stock CSV files", font: "Courier New", size: 20 })] }),
        new Paragraph({ spacing: { after: 40 }, children: [new TextRun({ text: "  data/etfs/         - ETF CSV files (QQQ)", font: "Courier New", size: 20 })] }),
        new Paragraph({ spacing: { after: 40 }, children: [new TextRun({ text: "  src/__init__.py    - Package init", font: "Courier New", size: 20 })] }),
        new Paragraph({ spacing: { after: 40 }, children: [new TextRun({ text: "  src/config.py      - Configuration & constants", font: "Courier New", size: 20 })] }),
        new Paragraph({ spacing: { after: 40 }, children: [new TextRun({ text: "  src/data_loader.py - Load & clean CSV data", font: "Courier New", size: 20 })] }),
        new Paragraph({ spacing: { after: 40 }, children: [new TextRun({ text: "  src/features.py    - Rolling feature computation", font: "Courier New", size: 20 })] }),
        new Paragraph({ spacing: { after: 40 }, children: [new TextRun({ text: "  src/detector.py    - Rule-based detection & severity", font: "Courier New", size: 20 })] }),
        new Paragraph({ spacing: { after: 40 }, children: [new TextRun({ text: "  src/clustering.py  - K-Means & DBSCAN models", font: "Courier New", size: 20 })] }),
        new Paragraph({ spacing: { after: 40 }, children: [new TextRun({ text: "  src/walkforward.py - Main pipeline orchestration", font: "Courier New", size: 20 })] }),
        new Paragraph({ spacing: { after: 40 }, children: [new TextRun({ text: "  src/query.py       - Date query interface", font: "Courier New", size: 20 })] }),
        new Paragraph({ spacing: { after: 40 }, children: [new TextRun({ text: "  src/monthly.py     - Monthly mini-report", font: "Courier New", size: 20 })] }),
        new Paragraph({ spacing: { after: 200 }, children: [new TextRun({ text: "  output/            - Generated CSVs, plots, reports", font: "Courier New", size: 20 })] }),

        new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("9.2 Commands")] }),
        new Paragraph({ spacing: { after: 60 }, children: [new TextRun({ text: "# Run full pipeline", font: "Courier New", size: 20, color: "888888" })] }),
        new Paragraph({ spacing: { after: 100 }, children: [new TextRun({ text: "python -m src.walkforward", font: "Courier New", size: 20 })] }),
        new Paragraph({ spacing: { after: 60 }, children: [new TextRun({ text: "# Query a specific date", font: "Courier New", size: 20, color: "888888" })] }),
        new Paragraph({ spacing: { after: 100 }, children: [new TextRun({ text: "python -m src.query --date 2020-02-27", font: "Courier New", size: 20 })] }),
        new Paragraph({ spacing: { after: 60 }, children: [new TextRun({ text: "# Generate monthly report", font: "Courier New", size: 20, color: "888888" })] }),
        new Paragraph({ spacing: { after: 200 }, children: [new TextRun({ text: "python -m src.monthly --month 2020-02", font: "Courier New", size: 20 })] }),

        // 10. CONCLUSION
        new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("10. Conclusion")] }),
        new Paragraph({ spacing: { after: 120 }, children: [
          new TextRun("This project demonstrates that simple statistical methods can effectively detect unusual market behavior without labeled data or complex models. Key takeaways:")
        ]}),
        new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [
          new TextRun({ text: "Rolling features prevent leakage: ", bold: true }),
          new TextRun("By computing statistics using only past data, the system simulates real-time detection.")
        ]}),
        new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [
          new TextRun({ text: "Multiple methods provide complementary views: ", bold: true }),
          new TextRun("Rule-based detection catches obvious extremes, K-Means finds structural outliers, DBSCAN identifies isolated anomalies.")
        ]}),
        new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [
          new TextRun({ text: "COVID crash validation: ", bold: true }),
          new TextRun("The test period (2020-Q1) proved the system works in extreme conditions, correctly flagging the historic market crash.")
        ]}),
        new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [
          new TextRun({ text: "Flag rate control: ", bold: true }),
          new TextRun("K-Means (5-7%) and DBSCAN (2-5%) maintain disciplined anomaly rates within the target 2-8% range.")
        ]}),
        new Paragraph({ spacing: { before: 200, after: 200 }, children: [
          new TextRun({ text: "Disclaimer: ", bold: true, italics: true }),
          new TextRun({ text: "This is educational analytics only and not investment advice.", italics: true })
        ]}),
      ]
    }
  ]
});

const outPath = "C:\\Users\\bhavi\\Downloads\\anamoly detection\\output\\Stock_Market_Anomaly_Detection_Report.docx";
Packer.toBuffer(doc).then(buffer => {
  fs.writeFileSync(outPath, buffer);
  console.log("Document saved to:", outPath);
}).catch(err => {
  console.error("Error:", err.message);
  process.exit(1);
});

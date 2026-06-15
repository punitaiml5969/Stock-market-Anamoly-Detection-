\# Stock Market Anomaly Detection



\## Overview



This project detects unusual stock market behavior using statistical methods and unsupervised machine learning techniques. The system identifies abnormal trading days based on price movements, trading volume, and intraday volatility.



\## Problem Statement



Financial markets often experience unusual events such as crashes, spikes, and volume shocks. The goal of this project is to automatically detect such anomalies without using labeled data.



\## Dataset



\* Source: Kaggle NASDAQ Daily OHLCV Dataset

\* Stocks Used:



&#x20; \* QQQ

&#x20; \* AAPL

&#x20; \* AMZN

&#x20; \* GOOG

&#x20; \* FB

&#x20; \* ADBE

&#x20; \* CSCO



\## Feature Engineering



Three rolling features were created:



\### Return Z-Score



Measures how unusual today's return is compared to historical returns.



\### Volume Z-Score



Measures abnormal trading volume using rolling statistics.



\### Intraday Range Percentile



Measures how large today's trading range is compared to recent history.



\## Methods Used



\### Rule-Based Detection



Flags observations when:



\* Return Z-Score exceeds threshold

\* Volume Z-Score exceeds threshold

\* Range Percentile exceeds threshold



\### K-Means Clustering



Detects anomalies based on distance from cluster centroids.



\### DBSCAN



Detects sparse observations and noise points as anomalies.



\## Results



\### Key Findings



\* Successfully identified COVID-19 market crash periods.

\* Detected extreme price movements and volume shocks.

\* Compared Rule-Based, K-Means, and DBSCAN approaches.



\## Visualizations



\### K-Means Scatter Plot



!\[KMeans Scatter](output/kmeans\_scatter.png)



\### Market Dashboard



!\[Market Dashboard](output/test\_market\_dashboard.png)



\### Cumulative Returns with Anomalies



!\[Returns](output/cumulative\_returns\_anomalies.png)



\## Project Structure



```text

anamoly-detection/

│

├── src/

├── output/

├── create\_doc.js

├── .gitignore

└── README.md

```



\## How to Run



```bash

python -m src.walkforward

```



\### Query a Specific Date



```bash

python -m src.query --date 2020-02-27

```



\### Generate Monthly Report



```bash

python -m src.monthly --month 2020-02

```



\## Technologies Used



\* Python

\* Pandas

\* NumPy

\* Scikit-Learn

\* Matplotlib

\* DBSCAN

\* K-Means



\## Future Improvements



\* Isolation Forest

\* One-Class SVM

\* Real-Time Market Monitoring

\* Live Data Integration



\## Disclaimer



This project is for educational and research purposes only and should not be considered financial or investment advice.




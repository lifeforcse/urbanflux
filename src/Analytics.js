import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts";

/* ============================================
   LINEAR REGRESSION CLASS
============================================ */

class LinearRegression {
  constructor() {
    this.slope = 0;
    this.intercept = 0;
    this.rSquared = 0;
    this.isValid = false;
  }

  fit(data) {
    if (!data || data.length < 2) {
      this.isValid = false;
      return this;
    }

    const n = data.length;
    let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;

    data.forEach(point => {
      sumX += point.x;
      sumY += point.y;
      sumXY += point.x * point.y;
      sumX2 += point.x * point.x;
    });

    const denominator = n * sumX2 - sumX * sumX;
    if (denominator === 0) {
      this.isValid = false;
      return this;
    }

    this.slope = (n * sumXY - sumX * sumY) / denominator;
    this.intercept = (sumY - this.slope * sumX) / n;

    const meanY = sumY / n;
    let ssTotal = 0, ssResidual = 0;

    data.forEach(point => {
      const predictedY = this.predict(point.x);
      ssTotal += Math.pow(point.y - meanY, 2);
      ssResidual += Math.pow(point.y - predictedY, 2);
    });

    this.rSquared = ssTotal === 0 ? 0 : 1 - (ssResidual / ssTotal);
    this.isValid = true;

    return this;
  }

  predict(x) {
    return this.slope * x + this.intercept;
  }

  generateTrendline(data, futurePoints = 5) {
    if (!this.isValid) return [];

    const trendline = [];
    const maxX = Math.max(...data.map(d => d.x));

    data.forEach(point => {
      trendline.push({
        x: point.x,
        y: this.predict(point.x),
        type: "historical",
      });
    });

    for (let i = 1; i <= futurePoints; i++) {
      trendline.push({
        x: maxX + i,
        y: this.predict(maxX + i),
        type: "predicted",
      });
    }

    return trendline;
  }
}

/* ============================================
   ANOMALY DETECTOR
============================================ */

const AnomalyDetector = {
  calculateMean(data) {
    if (!data.length) return 0;
    return data.reduce((sum, val) => sum + val, 0) / data.length;
  },

  calculateStdDev(data, mean) {
    if (data.length < 2) return 0;
    const squaredDiffs = data.map(val => Math.pow(val - mean, 2));
    const avg = squaredDiffs.reduce((sum, val) => sum + val, 0) / data.length;
    return Math.sqrt(avg);
  },

  detect(data) {
    if (!data || data.length < 2)
      return { anomalies: [], mean: 0, stdDev: 0 };

    const values = data.map(d => d.y);
    const mean = this.calculateMean(values);
    const stdDev = this.calculateStdDev(values, mean);

    const anomalies = data.map((point, index) => {
      const zScore = stdDev === 0 ? 0 : (point.y - mean) / stdDev;
      return {
        ...point,
        zScore,
        isAnomaly: Math.abs(zScore) > 2,
        index,
      };
    });

    return { anomalies, mean, stdDev };
  },

  getAlerts(anomalies) {
    return anomalies
      .filter(a => a.isAnomaly)
      .map(a => ({
        x: a.x,
        y: a.y,
        zScore: a.zScore,
      }));
  },
};

/* ============================================
   INITIAL DATA
============================================ */

const INITIAL_DATA = [
  { x: 1, y: 120, label: "08:00" },
  { x: 2, y: 135, label: "09:00" },
  { x: 3, y: 128, label: "10:00" },
  { x: 4, y: 142, label: "11:00" },
  { x: 5, y: 138, label: "12:00" },
  { x: 6, y: 155, label: "13:00" },
  { x: 7, y: 148, label: "14:00" },
  { x: 8, y: 162, label: "15:00" },
  { x: 9, y: 175, label: "16:00" },
  { x: 10, y: 168, label: "17:00" },
];

const BENCHMARK_DATA = [
  { subject: "Delivery Time", A: 85, fullMark: 100 },
  { subject: "Cost Efficiency", A: 78, fullMark: 100 },
  { subject: "Freshness", A: 92, fullMark: 100 },
  { subject: "Inventory", A: 70, fullMark: 100 },
  { subject: "Vendor Perf", A: 88, fullMark: 100 },
  { subject: "Route Opt", A: 82, fullMark: 100 },
];

/* ============================================
   ANALYTICS COMPONENT
============================================ */

const Analytics = () => {
  const [data, setData] = useState(INITIAL_DATA);
  const [regression, setRegression] = useState(new LinearRegression());
  const [anomalyResult, setAnomalyResult] = useState({ anomalies: [], mean: 0, stdDev: 0 });
  const [trendline, setTrendline] = useState([]);

  const analyzeData = useCallback((points) => {
    const reg = new LinearRegression().fit(points);
    setRegression(reg);

    const anomaly = AnomalyDetector.detect(points);
    setAnomalyResult(anomaly);

    setTrendline(reg.generateTrendline(points));
  }, []);

  useEffect(() => {
    analyzeData(data);
  }, [data, analyzeData]);

  const composedData = useMemo(() => {
    return data.map(point => {
      const trendPoint = trendline.find(t => t.x === point.x);
      return {
        ...point,
        trendline: trendPoint ? trendPoint.y : null,
      };
    });
  }, [data, trendline]);

  return (
    <div style={{ padding: "30px" }}>
      <h2>Predictive Analytics</h2>

      <ResponsiveContainer width="100%" height={320}>
        <ComposedChart data={composedData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="x" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="y" fill="#3b82f6" name="Historical" />
          <Line
            type="monotone"
            dataKey="trendline"
            stroke="#ef4444"
            strokeDasharray="5 5"
            dot={false}
            name="Trend"
          />
        </ComposedChart>
      </ResponsiveContainer>

      <ResponsiveContainer width="100%" height={320}>
        <RadarChart data={BENCHMARK_DATA}>
          <PolarGrid />
          <PolarAngleAxis dataKey="subject" />
          <PolarRadiusAxis domain={[0, 100]} />
          <Radar
            name="Performance"
            dataKey="A"
            stroke="#3b82f6"
            fill="#3b82f6"
            fillOpacity={0.3}
          />
          <Radar
            name="Benchmark"
            dataKey="fullMark"
            stroke="#16a34a"
            fill="none"
            strokeDasharray="3 3"
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default Analytics;

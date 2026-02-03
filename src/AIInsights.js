import React, { useState } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
  AreaChart,
  Area,
} from "recharts";

const AIInsights = () => {
  const [activeTab, setActiveTab] = useState("All");

  const aiEngineData = [
    { day: "Mon", value: 65 },
    { day: "Tue", value: 72 },
    { day: "Wed", value: 78 },
    { day: "Thu", value: 82 },
    { day: "Fri", value: 85 },
    { day: "Sat", value: 88 },
    { day: "Sun", value: 84 },
  ];

  const predictionsData = [
    { day: "Mon", predicted: 28, actual: 26 },
    { day: "Tue", predicted: 32, actual: 31 },
    { day: "Wed", predicted: 25, actual: 24 },
    { day: "Thu", predicted: 30, actual: 29 },
    { day: "Fri", predicted: 35, actual: 34 },
    { day: "Sat", predicted: 28, actual: 27 },
    { day: "Sun", predicted: 26, actual: 25 },
  ];

  const recommendationData = [
    { category: "Labor", score: 88 },
    { category: "Fuel", score: 92 },
    { category: "Routes", score: 85 },
    { category: "Inventory", score: 79 },
    { category: "Suppliers", score: 81 },
  ];

  const allAlerts = [
    {
      type: "warning",
      title: "High Congestion Alert - East Plaza",
      description:
        "Traffic congestion expected to peak at 5PM. Recommend rerouting through Harbor Zone.",
      severity: 87,
      time: "11:35:18 AM",
      action: "Avoid 25min delay",
      category: "warning",
    },
    {
      type: "info",
      title: "Spoilage Risk - Urban Foods",
      description:
        "Predicted 18% spoilage risk if delivery exceeds 45 minutes. Current ETA: 42 minutes.",
      severity: 72,
      time: "10:22:45 AM",
      action: "Monitor closely",
      category: "warning",
    },
    {
      type: "success",
      title: "Optimal Route Identified",
      description:
        "New routing algorithm identified 12% efficiency gain for North District routes.",
      severity: 95,
      time: "09:15:30 AM",
      action: "Implement now",
      category: "optimization",
    },
    {
      type: "info",
      title: "Prediction Update: Delivery Times",
      description:
        "New model iteration shows 84% accuracy in delivery time predictions.",
      severity: 84,
      time: "08:45:20 AM",
      action: "View model",
      category: "prediction",
    },
    {
      type: "success",
      title: "Recommendation Accepted",
      description:
        "Supplier rotation recommendation accepted. Expected 8% improvement.",
      severity: 78,
      time: "07:30:15 AM",
      action: "Track results",
      category: "recommendation",
    },
  ];

  const getDisplayedAlerts = () => {
    if (activeTab === "All") return allAlerts;
    return allAlerts.filter(
      (alert) => alert.category.toLowerCase() === activeTab.toLowerCase()
    );
  };

  const displayedAlerts = getDisplayedAlerts();

  const tabs = ["All", "Optimization", "Warnings", "Predictions", "Recommendations"];

  return (
    <div style={styles.wrapper}>
      <div style={styles.header}>
        <h2>AI Insights</h2>
        <p style={styles.subtitle}>
          Intelligence-driven recommendations and predictions
        </p>
      </div>

      {/* Tabs */}
      <div style={styles.tabsContainer}>
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              ...styles.tab,
              ...(activeTab === tab ? styles.activeTab : {}),
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Alerts */}
      <div style={styles.alertsGrid}>
        {displayedAlerts.map((alert, idx) => (
          <div key={idx} style={styles.alertCard}>
            <h4>{alert.title}</h4>
            <p>{alert.description}</p>
            <small>{alert.time}</small>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div style={styles.chartsGrid}>
        <div style={styles.chartBox}>
          <h4>AI Engine Performance</h4>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={aiEngineData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Area type="monotone" dataKey="value" stroke="#2563eb" fill="#93c5fd" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div style={styles.chartBox}>
          <h4>Prediction Accuracy</h4>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={predictionsData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="predicted" stroke="#9ca3af" />
              <Line type="monotone" dataKey="actual" stroke="#16a34a" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div style={styles.chartBox}>
          <h4>Recommendation Impact</h4>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={recommendationData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="category" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="score" fill="#2563eb" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

const styles = {
  wrapper: {
    padding: "30px",
    background: "#f4f6f9",
    minHeight: "100vh",
  },
  header: { marginBottom: "20px" },
  subtitle: { color: "#6b7280" },
  tabsContainer: {
    display: "flex",
    gap: "10px",
    marginBottom: "20px",
  },
  tab: {
    padding: "8px 16px",
    border: "none",
    cursor: "pointer",
    background: "#e5e7eb",
  },
  activeTab: {
    background: "#2563eb",
    color: "#fff",
  },
  alertsGrid: {
    display: "grid",
    gap: "10px",
    marginBottom: "30px",
  },
  alertCard: {
    background: "#fff",
    padding: "15px",
    borderRadius: "8px",
  },
  chartsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "20px",
  },
  chartBox: {
    background: "#fff",
    padding: "15px",
    borderRadius: "10px",
    height: "300px",
  },
};

export default AIInsights;

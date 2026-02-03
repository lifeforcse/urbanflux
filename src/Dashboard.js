import React, { useState, useEffect } from "react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

/* ================================
   INITIAL DATA
================================ */

const INITIAL_VENDORS = [
  { id: 1, name: "Fresh Mart", location: "Downtown", demand: 95, congestionLevel: 45, baseDelay: 12 },
  { id: 2, name: "Urban Foods", location: "North District", demand: 65, congestionLevel: 30, baseDelay: 8 },
  { id: 3, name: "Metro Market", location: "East Plaza", demand: 54, congestionLevel: 60, baseDelay: 15 },
  { id: 4, name: "City Store", location: "South Market", demand: 96, congestionLevel: 75, baseDelay: 18 },
  { id: 5, name: "Prime Hub", location: "West End", demand: 72, congestionLevel: 40, baseDelay: 10 },
  { id: 6, name: "Quick Center", location: "Central Hub", demand: 91, congestionLevel: 55, baseDelay: 14 },
];

/* ================================
   GENETIC ALGORITHM
================================ */

const calculateFitness = (vendorOrder, vendors) => {
  let totalDelay = 0;
  let demandPriority = 0;

  for (let i = 0; i < vendorOrder.length; i++) {
    const vendor = vendors.find(v => v.id === vendorOrder[i]);
    if (vendor) {
      const positionDelay = vendor.baseDelay + (i * 2);
      const congestionMultiplier = 1 + (vendor.congestionLevel / 100);
      totalDelay += positionDelay * congestionMultiplier;
      demandPriority += vendor.demand;
    }
  }

  const fitness = (1 / (totalDelay + 1)) + (demandPriority * 0.01);
  return { fitness, totalDelay };
};

const generatePopulation = (vendors, size = 30) => {
  const population = [];
  for (let i = 0; i < size; i++) {
    const shuffled = [...vendors].sort(() => Math.random() - 0.5);
    population.push(shuffled.map(v => v.id));
  }
  return population;
};

const runGeneticOptimization = (vendors, generations = 20) => {
  let population = generatePopulation(vendors);
  let bestSolution = population[0];
  let bestFitness = calculateFitness(bestSolution, vendors).fitness;

  for (let g = 0; g < generations; g++) {
    const newPopulation = [];

    for (let i = 0; i < population.length; i++) {
      const candidate = population[i];
      const { fitness } = calculateFitness(candidate, vendors);

      if (fitness > bestFitness) {
        bestFitness = fitness;
        bestSolution = candidate;
      }

      newPopulation.push(candidate);
    }

    population = newPopulation;
  }

  return { bestSolution, bestFitness };
};

/* ================================
   DASHBOARD COMPONENT
================================ */

const Dashboard = () => {
  const [deliveryData, setDeliveryData] = useState([
    { time: "08:00", value: 28 },
    { time: "09:00", value: 35 },
    { time: "10:00", value: 42 },
    { time: "11:00", value: 38 },
    { time: "12:00", value: 32 },
    { time: "13:00", value: 29 },
  ]);

  const [costData, setCostData] = useState([
    { category: "Fuel", value: 75 },
    { category: "Labor", value: 88 },
    { category: "Storage", value: 62 },
    { category: "Maintenance", value: 45 },
  ]);

  const [optimizedVendors, setOptimizedVendors] = useState(
    INITIAL_VENDORS.map((v, i) => ({ ...v, rank: i + 1 }))
  );

  const [efficiencyGain, setEfficiencyGain] = useState(0);
  const [isOptimizing, setIsOptimizing] = useState(false);

  /* ================================
     LIVE DATA UPDATES
  ================================= */

  useEffect(() => {
    const interval = setInterval(() => {
      setDeliveryData(prev => {
        const newData = [...prev.slice(1)];
        const last = prev[prev.length - 1].value;
        const newValue = Math.max(20, Math.min(50, last + (Math.random() - 0.5) * 10));
        newData.push({ time: `${8 + newData.length}:00`, value: newValue });
        return newData;
      });
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  /* ================================
     RUN OPTIMIZATION
  ================================= */

  const runOptimization = () => {
    setIsOptimizing(true);

    const initialOrder = INITIAL_VENDORS.map(v => v.id);
    const initialStats = calculateFitness(initialOrder, INITIAL_VENDORS);

    const { bestSolution } = runGeneticOptimization(INITIAL_VENDORS);

    const optimizedStats = calculateFitness(bestSolution, INITIAL_VENDORS);

    const gain =
      ((optimizedStats.fitness - initialStats.fitness) / initialStats.fitness) * 100;

    setEfficiencyGain(Math.max(0, gain));

    const ranked = bestSolution.map((id, index) => {
      const vendor = INITIAL_VENDORS.find(v => v.id === id);
      return { ...vendor, rank: index + 1 };
    });

    setOptimizedVendors(ranked);
    setIsOptimizing(false);
  };

  /* ================================
     UI
  ================================= */

  return (
    <div style={styles.wrapper}>
      <h2>Urban Optimization Dashboard</h2>

      <button
        onClick={runOptimization}
        style={styles.button}
        disabled={isOptimizing}
      >
        {isOptimizing ? "Running..." : "Run Optimization"}
      </button>

      <h3>Efficiency Gain: {efficiencyGain.toFixed(2)}%</h3>

      <div style={styles.chartContainer}>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={deliveryData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" />
            <YAxis />
            <Tooltip />
            <Area type="monotone" dataKey="value" stroke="#3b82f6" fill="#93c5fd" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div style={styles.chartContainer}>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={costData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="category" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="value" fill="#16a34a" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <h3>Optimized Vendors</h3>
      <ul>
        {optimizedVendors.map(v => (
          <li key={v.id}>
            #{v.rank} - {v.name} ({v.location})
          </li>
        ))}
      </ul>
    </div>
  );
};

/* ================================
   STYLES
================================ */

const styles = {
  wrapper: {
    padding: "30px",
    background: "#f4f6f9",
    minHeight: "100vh",
  },
  button: {
    padding: "10px 16px",
    background: "#2563eb",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    marginBottom: "20px",
  },
  chartContainer: {
    background: "#fff",
    padding: "20px",
    borderRadius: "12px",
    marginBottom: "20px",
  },
};

export default Dashboard;

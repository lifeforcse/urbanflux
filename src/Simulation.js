import React, { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts";

import Engine from "./DecisionOptimizationEngine";

const Simulation = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [simulationProgress, setSimulationProgress] = useState(0);
  const [simulationComplete, setSimulationComplete] = useState(false);
  const [scenario, setScenario] = useState("Normal");
  const [weights, setWeights] = useState({ Wd: 0.35, Wf: 0.30, Wc: 0.20, Wr: 0.15 });
  const [strategies, setStrategies] = useState([]);
  const [ranking, setRanking] = useState([]);
  const [explanation, setExplanation] = useState("");
  const [sensitivity, setSensitivity] = useState(null);
  const [monteCarlo, setMonteCarlo] = useState(null);
  const [previousWeights, setPreviousWeights] = useState(null);
  const [learningDelta, setLearningDelta] = useState(null);
  const [scoreAdvantage, setScoreAdvantage] = useState(null);

  const COLORS = ["#2563eb", "#16a34a", "#f59e0b", "#ef4444"];

  /* ---------- SIMPLE LOGGER (CI SAFE) ---------- */
  const log = (text) => {
    console.log(text);
  };

  const handleRunSimulation = () => {
    setIsRunning(true);
    setSimulationProgress(0);
    setSimulationComplete(false);
    setExplanation("");

    const baseStrategies = [
      { id: 's1', vendor: 'Urban Foods', supplier: 'SwiftDeliver Inc', deliveryTime: 48, maxDelivery: 60, cost: 420, maxCost: 600, reliabilityPct: 92 },
      { id: 's2', vendor: 'Metro Market', supplier: 'SwiftDeliver Inc', deliveryTime: 50, maxDelivery: 60, cost: 400, maxCost: 600, reliabilityPct: 90 },
      { id: 's3', vendor: 'City Store', supplier: 'ColdChain Co', deliveryTime: 42, maxDelivery: 60, cost: 450, maxCost: 600, reliabilityPct: 95 },
      { id: 's4', vendor: 'Prime Hub', supplier: 'FreshRoute Corp', deliveryTime: 55, maxDelivery: 60, cost: 380, maxCost: 600, reliabilityPct: 88 },
    ];

    setStrategies(baseStrategies);
    const scenarioParams = getScenarioParams(scenario);

    const steps = [
      () => log('Aggregating city signals...'),
      () => log('Evaluating freshness decay'),
      () => log('Computing delivery efficiency'),
      () => runOptimization(baseStrategies, weights, scenarioParams),
      () => runLearning(baseStrategies),
      () => log('Recommendation generated'),
    ];

    let idx = 0;
    const interval = setInterval(() => {
      if (!steps[idx]) {
        clearInterval(interval);
        setIsRunning(false);
        setSimulationComplete(true);
        setSimulationProgress(100);
        return;
      }
      steps[idx]();
      idx++;
      setSimulationProgress(Math.round((idx / steps.length) * 100));
    }, 600);
  };

  const getScenarioParams = (sc) => {
    switch(sc) {
      case 'Peak Traffic': return { k: 0.04, deliveryMultiplier: 1.25, costMultiplier: 1, reliabilityModifier: 1 };
      case 'Demand Surge': return { k: 0.05, deliveryMultiplier: 1.1, costMultiplier: 1.05, reliabilityModifier: 1 };
      case 'Fuel Cost Spike': return { k: 0.04, deliveryMultiplier: 1.0, costMultiplier: 1.15, reliabilityModifier: 1 };
      case 'Supplier Breakdown': return { k: 0.06, deliveryMultiplier: 1.2, costMultiplier: 1.05, reliabilityModifier: 0.9 };
      case 'Cold Chain Failure': return { k: 0.10, deliveryMultiplier: 1.15, costMultiplier: 1.1, reliabilityModifier: 0.85 };
      default: return { k: 0.04, deliveryMultiplier: 1, costMultiplier: 1, reliabilityModifier: 1 };
    }
  };

  const runOptimization = (strategiesInput, weightsInput, scenarioParams) => {
    const { normalizedWeights, ranked } =
      Engine.rankStrategies(strategiesInput, weightsInput, scenarioParams);

    setWeights(normalizedWeights);
    setRanking(ranked);

    const mc = Engine.monteCarloSimulation(
      strategiesInput,
      weightsInput,
      scenarioParams,
      500
    );

    setMonteCarlo(mc);

    log('Optimization complete. Top strategy: ' + (ranked[0]?.vendor || 'N/A'));
  };

  const runLearning = (strategiesInput) => {
    const top = ranking[0];
    const avgDelay =
      strategiesInput.reduce((s, x) => s + x.deliveryTime, 0) /
      strategiesInput.length;

    const spoilageRisk =
      20 * (1 - (top ? top.computed.FreshnessScore : 0));

    const res = Engine.adaptiveLearning(weights, {
      spoilageRiskPercent: spoilageRisk,
      avgDelay,
      delayThreshold: 40,
    });

    setPreviousWeights(res.before);
    setWeights(res.after);
    setLearningDelta(res.delta);

    log('Model learning from outcome...');
  };

  useEffect(() => {
    if (strategies.length > 0) {
      const params = getScenarioParams(scenario);
      const { ranked } = Engine.rankStrategies(strategies, weights, params);
      setRanking(ranked);
    }
  }, [strategies, scenario, weights]);

  return (
    <div style={{ padding: 30 }}>
      <h2>Simulation Center</h2>

      <button onClick={handleRunSimulation} disabled={isRunning}>
        {isRunning ? `Running... ${simulationProgress}%` : "Run Simulation"}
      </button>

      {simulationComplete && (
        <div>
          <p>Simulation Complete</p>
          {ranking[0] && (
            <p>
              Top Strategy: {ranking[0].vendor} – {(ranking[0].computed.FDS * 100).toFixed(1)}%
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default Simulation;

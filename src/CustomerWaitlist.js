import React, { useState, useMemo } from "react";

/* ============================================
   CONSTANTS
============================================ */

const TOTAL_FLEET_CAPACITY = 5000;

const DISTRICT_DISTANCES = {
  "Downtown": 1.2,
  "North District": 1.5,
  "East Plaza": 1.8,
  "South Market": 2.0,
  "West End": 1.6,
  "Central Hub": 1.0,
  "Airport Zone": 2.5,
  "Industrial Park": 1.9,
  "Suburban": 2.2,
};

const INITIAL_WAITLIST = [
  { id: 1, name: "Fresh Mart", location: "Downtown", volume: 450, impact: 0, status: "pending" },
  { id: 2, name: "Urban Foods", location: "North District", volume: 320, impact: 0, status: "pending" },
  { id: 3, name: "City Store", location: "South Market", volume: 580, impact: 0, status: "pending" },
  { id: 4, name: "Prime Hub", location: "West End", volume: 210, impact: 0, status: "approved" },
];

/* ============================================
   COMPONENT
============================================ */

const CustomerWaitlist = () => {
  const [formData, setFormData] = useState({
    name: "",
    location: "",
    volume: "",
  });

  const [waitlist, setWaitlist] = useState(INITIAL_WAITLIST);
  const [activeTab, setActiveTab] = useState("pending");

  /* ---------------- AI Impact Calculation ---------------- */

  const calculateImpactScore = useMemo(() => {
    if (!formData.volume || !formData.location) return null;

    const volume = parseFloat(formData.volume);
    if (isNaN(volume) || volume <= 0) return null;

    const distanceFactor = DISTRICT_DISTANCES[formData.location] || 1.5;
    const impactScore = (volume / TOTAL_FLEET_CAPACITY) * distanceFactor * 100;

    let warningLevel = "low";
    let warningMessage = "Minimal fleet load increase";
    let warningColor = "#16a34a";
    let icon = "✅";

    if (impactScore > 15) {
      warningLevel = "high";
      warningMessage = "⚠️ Significant fleet load increase";
      warningColor = "#ef4444";
      icon = "🚨";
    } else if (impactScore > 8) {
      warningLevel = "medium";
      warningMessage = "⚠️ Moderate fleet load increase";
      warningColor = "#f59e0b";
      icon = "⚠️";
    }

    return {
      score: impactScore,
      volume,
      location: formData.location,
      warningLevel,
      warningMessage,
      warningColor,
      icon,
    };
  }, [formData.volume, formData.location]);

  /* ---------------- Handlers ---------------- */

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddCustomer = () => {
    if (!formData.name || !formData.location || !formData.volume) return;

    const newCustomer = {
      id: Date.now(),
      name: formData.name,
      location: formData.location,
      volume: parseFloat(formData.volume),
      impact: calculateImpactScore?.score || 0,
      status: "pending",
    };

    setWaitlist(prev => [...prev, newCustomer]);
    setFormData({ name: "", location: "", volume: "" });
  };

  const handleApprove = (id) => {
    setWaitlist(prev =>
      prev.map(customer =>
        customer.id === id
          ? { ...customer, status: "approved" }
          : customer
      )
    );
  };

  /* ---------------- Derived Data ---------------- */

  const filteredWaitlist = waitlist.filter(customer => {
    if (activeTab === "pending") return customer.status === "pending";
    if (activeTab === "approved") return customer.status === "approved";
    return true;
  });

  const pendingCount = waitlist.filter(c => c.status === "pending").length;
  const approvedCount = waitlist.filter(c => c.status === "approved").length;

  const totalPendingVolume = waitlist
    .filter(c => c.status === "pending")
    .reduce((sum, c) => sum + c.volume, 0);

  const totalImpact = waitlist
    .filter(c => c.status === "pending")
    .reduce((sum, c) => sum + c.impact, 0);

  /* ---------------- UI ---------------- */

  return (
    <div style={{ padding: "30px", background: "#f8fafc", minHeight: "100vh" }}>
      <h2>Customer Waitlist</h2>

      <p>Pending: {pendingCount}</p>
      <p>Approved: {approvedCount}</p>
      <p>Pending Volume: {totalPendingVolume} kg</p>
      <p>Total Impact: {totalImpact.toFixed(1)}%</p>

      {calculateImpactScore && (
        <div>
          <strong>Impact:</strong> +{calculateImpactScore.score.toFixed(2)}%
        </div>
      )}

      <input
        name="name"
        value={formData.name}
        onChange={handleInputChange}
        placeholder="Customer name"
      />

      <select
        name="location"
        value={formData.location}
        onChange={handleInputChange}
      >
        <option value="">Select district</option>
        {Object.keys(DISTRICT_DISTANCES).map(d => (
          <option key={d} value={d}>{d}</option>
        ))}
      </select>

      <input
        name="volume"
        type="number"
        value={formData.volume}
        onChange={handleInputChange}
        placeholder="Volume"
      />

      <button onClick={handleAddCustomer} disabled={!calculateImpactScore}>
        Add Customer
      </button>

      <hr />

      {filteredWaitlist.map(customer => (
        <div key={customer.id}>
          {customer.name} - {customer.location} - {customer.volume}kg
          {customer.status === "pending" && (
            <button onClick={() => handleApprove(customer.id)}>
              Approve
            </button>
          )}
        </div>
      ))}
    </div>
  );
};

export default CustomerWaitlist;

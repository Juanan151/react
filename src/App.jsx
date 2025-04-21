// App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import TransactionDetail from "./pages/TransactionDetail";
import BlockExplorer from "./pages/BlockExplorer";
import ProductDetail from "./pages/ProductDetail";
import TransactionExplorer from "./pages/TransactionExplorer";
import BlockDetail from "./pages/BlockDetail";
import TraceabilityExplorer from "./pages/TraceabilityExplorer";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<TraceabilityExplorer />} />
        <Route path="/blocks" element={<BlockExplorer />} />
        <Route path="/transactions" element={<TransactionExplorer />} />
        <Route path="/tx/:hash" element={<TransactionDetail />} />
        <Route path="/product/:id" element={<ProductDetail />} />
        <Route path="/block/:blockNumber" element={<BlockDetail />} />
      </Routes>
    </Router>
  );
}

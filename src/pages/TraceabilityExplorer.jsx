// Home.jsx
import React, { useState, useEffect, useRef } from "react";
import MainLayout from "../components/MainLayout";
import TraceabilityList from "../components/TraceabilityList";
import MapView from "../components/MapView";
import DashboardSummary from "../components/DashboardSummary";
import {
  getAllEventsByProductId,
  getDashboardStats,
  getLatestProductEvents,
  getTransactionByHash,
  getBlockByHash,
} from "../utils/rpcClient";
import { Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { PackageCheck, Clock4, Server, Boxes } from "lucide-react";

export default function TraceabilityExplorer() {
  const [selectedProduct, setSelectedProduct] = useState("PROD-001");
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("traceability");
  const [dashboardData, setDashboardData] = useState([]);
  const [traceabilityData, setTraceabilityData] = useState([]);
  const [traceEvents, setTraceEvents] = useState([]);
  const [loadingDashboard, setLoadingDashboard] = useState(false);
  const mapRef = useRef(null);
  const [mapAnimate, setMapAnimate] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const id = parseInt(selectedProduct.split("-")[1]);
    getAllEventsByProductId(id).then(setTraceEvents);

    if (mapRef.current) {
      mapRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
      setMapAnimate(true);
      setTimeout(() => setMapAnimate(false), 1000);
    }
  }, [selectedProduct]);

  useEffect(() => {
    const fetchStats = async () => {
      setLoadingDashboard(true);
      const stats = await getDashboardStats();
      setLoadingDashboard(false);

      if (!stats) return;

      const blocks = [
        {
          icon: <PackageCheck size={20} />,
          title: "Último bloque",
          value: `#${stats.block}`,
          subtext: `TXs en este bloque: ${stats.txCount}`,
          border: "border-blue-500",
        },
        {
          icon: <Clock4 size={20} />,
          title: "Fecha bloque",
          value: new Date(stats.timestamp * 1000).toLocaleString(),
          subtext: "Hora del último bloque",
          border: "border-purple-500",
        },
        {
          icon: <Server size={20} />,
          title: "Nodos activos",
          value: `${stats.peers} nodo(s) conectados`,
          subtext: "Conectados al nodo ADMIN",
          border: "border-green-500",
        },
        {
          icon: <Boxes size={20} />,
          title: "Productos únicos",
          value: `${stats.productIds} rastreados`,
          subtext: "IDs únicos desde el bloque 9",
          border: "border-yellow-500",
        },
      ];

      setDashboardData(blocks);
    };

    fetchStats();
    const interval = setInterval(fetchStats, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchList = async () => {
      const latest = await getLatestProductEvents();
      setTraceabilityData(latest);
    };

    fetchList();
    const interval = setInterval(fetchList, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleSearch = async (e) => {
    const term = searchTerm.trim();
    if (e.key === "Enter" && term) {
      if (term.startsWith("0x") && term.length === 66) {
        // Verificar si es un hash de transacción válido
        const transaction = await getTransactionByHash(term);
        if (transaction) {
          navigate(`/tx/${term}`);
        } else if (term.startsWith("0x")) {
          // Verificar si es un hash de bloque válido
          const block = await getBlockByHash(term);
          if (block) {
            navigate(`/block/${term}`);
          }
        } 
      } else if (term.toLowerCase().startsWith("prod-")) {
        const number = term.split("-")[1].padStart(1, "0"); // PROD-1 → 001
        navigate(`/product/PROD-${number}`);
      } else if (!isNaN(term)) {
        const number = term.padStart(3, "0");
        navigate(`/product/PROD-${number}`);
      }
    }
  };

  return (
    <MainLayout activeTab={activeTab} setActiveTab={setActiveTab}>
      <h1 className="text-3xl font-bold text-white mb-6">
        Sistema de Trazabilidad
      </h1>

      {/* Buscador */}
      <div className="flex items-center bg-[#161b22] px-4 py-2 rounded-full border border-[#30363d] shadow-sm hover:shadow-md transition-shadow w-full max-w-3xl mx-auto mb-6">
        <Search className="text-gray-400 mr-2" size={20} />
        <input
          type="text"
          placeholder="ID de producto ( 'PROD-1' o '1' ), hash de block o de TX"
          autoComplete="off"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={handleSearch}
          className="bg-transparent w-full text-white placeholder-gray-500 focus:outline-none"
        />
      </div>

      {/* Cuerpo principal */}
      <div className="flex flex-col lg:flex-row gap-6 w-full">
        <div
          ref={mapRef}
          className={`w-full lg:w-7/10 h-[500px] bg-[#161b22] rounded-xl border border-[#30363d] overflow-hidden transition-shadow ${
            mapAnimate ? "animate-ping-border" : ""
          }`}
        >
          <MapView events={traceEvents} />
        </div>

        <div className="w-full lg:w-3/10 bg-[#161b22] rounded-xl p-4 border border-[#30363d] overflow-y-auto max-h-[500px]">
          <h2 className="text-lg font-semibold mb-3">
            Últimas ubicaciones productos
          </h2>
          <TraceabilityList
            onSelect={setSelectedProduct}
            searchTerm={searchTerm}
            data={traceabilityData}
          />
        </div>
      </div>

      <DashboardSummary data={dashboardData} loading={loadingDashboard} />
    </MainLayout>
  );
}

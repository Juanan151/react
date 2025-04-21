// pages/ProductDetail.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getAllEventsByProductId } from "../utils/rpcClient";
import MainLayout from "../components/MainLayout";
import MapView from "../components/MapView";
import {
  MapPin,
  Globe,
  GaugeCircle,
  Mountain,
  SatelliteDish,
  Link as LinkIcon,
  ArrowLeft,
  Repeat
} from "lucide-react";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const numericId = parseInt(id?.replace("PROD-", ""));
  const [events, setEvents] = useState([]);

  useEffect(() => {
    if (!isNaN(numericId)) {
      getAllEventsByProductId(numericId).then(setEvents);
    }
  }, [numericId]);

  const metrics = {
    avgSpeed: average(events.map((e) => e.speed)),
    avgSatellites: average(events.map((e) => e.satellites)),
  };

  return (
    <MainLayout  >
      
      <div className="flex items-center justify-between mb-4">
      <h1 className="text-3xl font-bold text-white mb-6">Detalles del Producto</h1>
        <h2 className="text-3xl font-bold text-white">
          <span className="text-blue-400">PROD-{numericId}</span>
        </h2>
      </div>
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => navigate(-1)}
          className="bg-gray-100 text-black font-semibold px-4 py-1.5 rounded-md hover:bg-white transition"
        >
          <ArrowLeft size={16} className="inline mr-1" /> Volver
        </button>
      </div>

      {/* Layout principal */}
      <div className="flex flex-col lg:flex-row gap-6 mb-6">
        {/* Mapa */}
        <div className="w-full lg:w-1/2 h-[400px] bg-[#161b22] rounded-xl border border-[#30363d] overflow-hidden">
          <MapView events={events} />
        </div>

        {/* Métricas + Gráfico */}
        <div className="w-full lg:w-1/2 flex flex-col gap-6">
          {/* Métricas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <MetricCard
              label="Velocidad media"
              value={`${metrics.avgSpeed.toFixed(1)} km/h`}
            />
            <MetricCard
              label="Satélites promedio"
              value={`${metrics.avgSatellites.toFixed(1)}`}
            />
          </div>

          {/* Gráfica */}
          <div className="bg-[#0d1117] border border-[#30363d] rounded-xl p-4">
            <h2 className="text-lg font-semibold mb-4 text-white">
              Evolución velocidad
            </h2>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={events.map((e, i) => ({ ...e, index: i + 1 }))}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2d3748" />
                <XAxis dataKey="index" stroke="#cbd5e0" />
                <YAxis stroke="#cbd5e0" />
                <Tooltip
                  contentStyle={{ background: "#1a202c", border: "none" }}
                />
                <Line
                  type="monotone"
                  dataKey="speed"
                  stroke="#3b82f6"
                  name="Velocidad"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Lista de eventos */}
      <div className="mt-10">
        <h2 className="text-lg font-semibold mb-4 text-white">
          Eventos GPS registrados
        </h2>

        <div className="space-y-4">
          {events.map((e, i) => (
            <div
              key={i}
              className="bg-[#0d1117] border border-[#30363d] rounded-xl p-5 text-white shadow hover:shadow-lg transition"
            >
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-2 text-blue-400 text-sm font-semibold">
                  <MapPin size={20} />
                  Punto {i + 1}
                </div>
                {i === events.length - 1 && (
                  <span className="text-xs bg-red-600 text-white px-2 py-0.5 rounded-full">
                    Último
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-sm text-gray-300">
                <div className="flex items-center gap-2">
                  <Globe size={14} className="text-teal-400" />
                  <span>
                    {e.latitude.toFixed(4)}, {e.longitude.toFixed(4)}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Mountain size={14} className="text-orange-400" />
                  <span>Altitud: {e.altitude} m</span>
                </div>

                <div className="flex items-center gap-2">
                  <GaugeCircle size={14} className="text-pink-400" />
                  <span>Velocidad: {e.speed} km/h</span>
                </div>

                <div className="flex items-center gap-2">
                  <SatelliteDish size={14} className="text-yellow-400" />
                  <span>Satélites: {e.satellites}</span>
                </div>
              </div>

              <div className="mt-3 flex items-center gap-2 text-sm text-blue-400 hover:underline">
                <Repeat size={14} />
                <a href={`/tx/${e.txHash}`} className="truncate">
                  {e.txHash}
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </MainLayout>
  );
}

function MetricCard({ label, value }) {
  return (
    <div className="bg-[#0d1117] border border-[#30363d] rounded-xl p-4 text-center">
      <p className="text-sm text-gray-400">{label}</p>
      <p className="text-xl font-semibold text-white mt-1">{value}</p>
    </div>
  );
}

function average(arr) {
  if (!arr.length) return 0;
  const sum = arr.reduce((acc, n) => acc + n, 0);
  return sum / arr.length;
}

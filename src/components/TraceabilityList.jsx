import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getLatestProductEvents } from "../utils/rpcClient";
import {
  Compass,
  Globe,
  Gauge,
  Triangle,
  Satellite,
} from "lucide-react";

export default function TraceabilityList({ onSelect, searchTerm }) {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const fetchEvents = async () => {
      const latest = await getLatestProductEvents();
      setEvents(latest);
    };

    fetchEvents();
    const interval = setInterval(fetchEvents, 15000);
    return () => clearInterval(interval);
  }, []);

  const normalizedTerm = searchTerm.trim().toLowerCase();

  const showAll =
    normalizedTerm === "" ||
    ["p", "pr", "pro", "prod", "prod-", "0"].includes(normalizedTerm) ||
    normalizedTerm.startsWith("0x");

  const filtered = events
    .filter((item) => item.id !== 0)
    .filter((item) => {
      if (showAll) return true;

      const productId = `prod-${item.id}`.toLowerCase();
      return (
        productId.includes(normalizedTerm) ||
        item.id.toString().includes(normalizedTerm) ||
        item.txHash.toLowerCase().includes(normalizedTerm)
      );
    });

  if (filtered.length === 0) {
    return <p className="text-gray-400">No se encontraron productos</p>;
  }

  return (
    <div className="space-y-4">
      {filtered.map((item) => (
        <div
          key={item.txHash}
          onClick={() => onSelect(`PROD-${item.id}`)}
          className="group bg-[#0d1117] border border-[#30363d] rounded-xl p-4 cursor-pointer hover:bg-[#21262d] hover:shadow-md hover:scale-[1.01] transition-all relative"
        >
          {/* Badge de bloque */}
          <span
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/block/${item.blockNumber}`);
            }}
            className="absolute bottom-2 right-3 bg-blue-600 text-white text-[10px] px-2 py-0.5 rounded-full font-semibold opacity-80 hover:opacity-100 hover:scale-105 transition transform cursor-pointer"
          >
            Bloque #{item.blockNumber}
          </span>

          {/* Hash */}
          <div className="flex items-center gap-3 mb-2">
            <Compass
              className="text-blue-400 group-hover:scale-110 transition-transform duration-200"
              size={20}
            />
            <span
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/tx/${item.txHash}`);
              }}
              className="text-sm text-blue-400 truncate hover:underline cursor-pointer"
            >
              {item.txHash}
            </span>
          </div>

          {/* Producto */}
          <p className="text-sm mb-1">
            <span className="text-white font-medium">Producto:</span>{" "}
            <span
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/product/PROD-${item.id}`);
              }}
              className="text-blue-400 hover:underline cursor-pointer"
            >
              PROD-{item.id}
            </span>
          </p>

          {/* Datos GPS */}
          <div className="flex flex-wrap gap-2 text-xs text-gray-400 mt-2">
            <span className="flex items-center gap-1 group-hover:text-teal-300 transition-colors duration-200">
              <Globe className="text-teal-300 group-hover:scale-110 transition-transform" size={14} />
              {item.latitude.toFixed(4)}, {item.longitude.toFixed(4)}
            </span>
            <span className="flex items-center gap-1 group-hover:text-pink-300 transition-colors duration-200">
              <Gauge className="text-pink-300 group-hover:scale-110 transition-transform" size={14} />
              {item.speed} km/h
            </span>
            <span className="flex items-center gap-1 group-hover:text-orange-300 transition-colors duration-200">
              <Triangle className="text-orange-300 group-hover:scale-110 transition-transform" size={14} />
              Alt: {item.altitude} m
            </span>
            <span className="flex items-center gap-1 group-hover:text-yellow-300 transition-colors duration-200">
              <Satellite className="text-yellow-300 group-hover:scale-110 transition-transform" size={14} />
              {item.satellites} sats
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

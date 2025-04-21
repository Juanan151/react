import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ClipboardCopy,
  Check,
  ArrowLeft,
  DollarSign,
  Cpu,
  Info,
  ArrowDownRight,
  ArrowUpRight,
  Layers,
  FileText,
  Flame,
  Calendar,
} from "lucide-react";
import { getBlockByNumber, getBlockByHash } from "../utils/rpcClient";
import MainLayout from "../components/MainLayout";
import CopyButton from "../components/CopyButton";

export default function BlockDetail() {
  const { blockNumber } = useParams();
  const navigate = useNavigate();
  const [block, setBlock] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (blockNumber.startsWith("0x")) {
      // Si el parámetro es un hash
      getBlockByHash(blockNumber).then((res) => {
        setBlock(res);
        setLoading(false);
      });
    } else {
      // Si el parámetro es un número de bloque
      getBlockByNumber(parseInt(blockNumber)).then((res) => {
        setBlock(res);
        setLoading(false);
      });
    }
  }, [blockNumber]);

  const hexToInt = (hex) => parseInt(hex || "0x0", 16);

  const handleCopy = () => {
    if (!block?.hash) return;
    navigator.clipboard.writeText(block.hash);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  if (loading) {
    return (
      <MainLayout>
        <p className="text-center text-gray-400 mt-20">
          Cargando bloque real desde RPC...
        </p>
      </MainLayout>
    );
  }

  if (!block) {
    return (
      <MainLayout activeTab="blocks" setActiveTab={() => {}}>
        <p className="text-center text-red-400 mt-20">Bloque no encontrado.</p>
      </MainLayout>
    );
  }

  const blockNumberInt = hexToInt(block.number);
  const gasUsed = hexToInt(block.gasUsed);
  const gasLimit = hexToInt(block.gasLimit);
  const baseFeePerGas = hexToInt(block.baseFeePerGas);
  const timestamp = new Date(parseInt(block.timestamp, 16) * 1000).toLocaleString();
  const extraData = block.extraData || "Sin datos adicionales";

  const gasUsedPercentage = ((gasUsed / gasLimit) * 100).toFixed(2); // Calculamos el porcentaje de gas utilizado

  return (
    <MainLayout>
      <h1 className="text-3xl font-bold text-white mb-6">Detalles del Bloque</h1>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <button
          onClick={() => navigate(-1)}
          className="bg-gray-100 text-black font-semibold px-4 py-2 rounded-md hover:bg-white transition"
        >
          <ArrowLeft size={16} className="inline mr-1" />
          Volver
        </button>
      </div>

      {/* Hash principal */}
      <div className="bg-[#0d1117] border border-[#30363d] rounded-lg px-5 py-4 flex justify-between items-center mb-6 shadow">
        <div>
          <p className="text-sm text-gray-400 mb-1">Hash</p>
          <p className="text-white font-mono text-sm break-all">{block.hash}</p>
          <span className="text-green-400 text-xs mt-1 inline-block">
            ✔ Confirmado
          </span>
        </div>
        <CopyButton textToCopy={block.hash} />
      </div>

      {/* Grid de datos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <Card
          icon={<Layers />}
          label="Bloque"
          value={
            <Link
              to={`/block/${blockNumberInt}`}
              className="text-blue-400 hover:underline"
            >
              #{blockNumberInt}
            </Link>
          }
        />
        <Card icon={<Flame />} label="Gas usado" value={`${gasUsed} wei`} />
        <Card
          icon={<DollarSign />}
          label="Gas límite"
          value={`${gasLimit} wei`}
        />
        <Card
          icon={<DollarSign />}
          label="Base Fee per Gas"
          value={`${baseFeePerGas} wei`}
        />
        <Card
          icon={<Calendar />}
          label="Timestamp"
          value={timestamp}
        />
        <Card
          icon={<Info />}
          label="Extra Data"
          value={extraData}
        />
      </div>

      {/* Transacciones */}
      <div className="bg-[#0d1117] border border-[#30363d] rounded-lg p-5 mb-6 shadow">
        <h2 className="flex items-center gap-2 text-white font-semibold mb-3">
          <FileText size={18} className="text-yellow-400" />
          Transacciones del Bloque
        </h2>
        <div>
          <ul>
            {block.transactions.map((txHash, index) => (
              <li
                key={index}
                className="py-3 px-5 bg-[#161b22] rounded-lg mb-4 hover:bg-[#1e242c] transition-all"
              >
                <Link
                  to={`/tx/${txHash}`}
                  className="text-blue-400 hover:underline"
                >
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">Transacción - {txHash}</span>
                    <CopyButton textToCopy={txHash} />
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </MainLayout>
  );
}

function Card({ icon, label, value }) {
  return (
    <div className="bg-[#0d1117] border border-[#30363d] rounded-lg p-4 hover:shadow-md transition">
      <div className="flex items-center gap-2 mb-1 text-gray-400 text-sm">
        {icon} {label}
      </div>
      <div className="text-white font-mono text-sm break-words">{value}</div>
    </div>
  );
}

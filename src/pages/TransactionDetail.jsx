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
  Flame,
  FileText,
} from "lucide-react";
import { getTransactionByHash } from "../utils/rpcClient";
import MainLayout from "../components/MainLayout";
import CopyButton from "../components/CopyButton";

export default function TransactionDetail() {
  const { hash } = useParams();
  const navigate = useNavigate();
  const [tx, setTx] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    getTransactionByHash(hash).then((res) => {
      setTx(res);
      setLoading(false);
    });
  }, [hash]);

  const hexToInt = (hex) => parseInt(hex || "0x0", 16);

  const decodeInput = (hex) => {
    try {
      if (!hex || hex === "0x") return null;
      const raw = hex.startsWith("0x") ? hex.slice(2) : hex;
      const buffer = new Uint8Array(raw.match(/.{1,2}/g).map((b) => parseInt(b, 16)));
      const decoded = new TextDecoder().decode(buffer).replace(/\0/g, "");
      return decoded.split("$")[1] || "(Formato desconocido)";
    } catch {
      return "(No legible)";
    }
  };

  const handleCopy = () => {
    if (!tx?.hash) return;
    navigator.clipboard.writeText(tx.hash);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  if (loading) {
    return (
      <MainLayout activeTab="transactions" setActiveTab={() => {}}>
        <p className="text-center text-gray-400 mt-20">
          Cargando transacción real desde RPC...
        </p>
      </MainLayout>
    );
  }

  if (!tx) {
    return (
      <MainLayout activeTab="transactions" setActiveTab={() => {}}>
        <p className="text-center text-red-400 mt-20">
          Transacción no encontrada.
        </p>
      </MainLayout>
    );
  }

  const wei = hexToInt(tx.value);
  const gasPrice = hexToInt(tx.gasPrice);
  const gas = hexToInt(tx.gas);
  const eth = (wei / 1e18).toFixed(6);
  const gwei = (gasPrice / 1e9).toFixed(2);
  const blockNumber = hexToInt(tx.blockNumber);

  return (
    <MainLayout >
      <h1 className="text-3xl font-bold text-white mb-6">Detalles de la Transacción</h1>
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
          <p className="text-white font-mono text-sm break-all">{tx.hash}</p>
          <span className="text-green-400 text-xs mt-1 inline-block">✔ Confirmada</span>
        </div>
        <CopyButton textToCopy={tx.hash} />
      </div>

      {/* Grid de datos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <Card
          icon={<Layers />}
          label="Bloque"
          value={
            <Link
              to={`/block/${blockNumber}`}
              className="text-blue-400 hover:underline"
            >
              #{blockNumber}
            </Link>
          }
        />
        <Card icon={<Flame />} label="Gas usado" value={`${gas} wei`} />
        <Card icon={<DollarSign />} label="Valor" value={`${wei} wei (${eth} ETH)`} />
        <Card icon={<DollarSign />} label="Gas Price" value={`${gasPrice} wei (${gwei} Gwei)`} />
        <Card icon={<Cpu />} label="Nonce" value={hexToInt(tx.nonce)} />
        <Card icon={<Info />} label="Llamada a contrato" value={tx.input && tx.input !== "0x" ? "Sí" : "No"} />
      </div>

      {/* Direcciones */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card icon={<ArrowUpRight />} label="Desde" value={<code>{tx.from}</code>} />
        <Card icon={<ArrowDownRight />} label="Hacia" value={<code>{tx.to || "CREACIÓN DE CONTRATO"}</code>} />
      </div>

      {/* Datos crudos */}
      {tx.input && tx.input !== "0x" && (
        <div className="bg-[#0d1117] border border-[#30363d] rounded-lg p-5 shadow">
          <h2 className="flex items-center gap-2 text-white font-semibold mb-3">
            <FileText size={18} className="text-yellow-400" />
            ExtraData
          </h2>
          <div className="mb-3">
            <p className="text-sm text-gray-400 mb-1">Hex</p>
            <code className="block bg-[#161b22] p-3 rounded text-sm text-white overflow-x-auto">
              {tx.input}
            </code>
          </div>
          <div>
            <p className="text-sm text-gray-400 mb-1">Decodificado</p>
            <code className="block bg-[#161b22] p-3 rounded text-sm text-white overflow-x-auto">
              {decodeInput(tx.input)}
            </code>
          </div>
        </div>
      )}
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

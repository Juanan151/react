import React, { useEffect, useState } from "react";
import { getBlockByNumber, getLatestBlockNumber } from "../utils/rpcClient";
import { Cuboid, ClipboardCopy, Check } from "lucide-react";
import { Link } from "react-router-dom";
import MainLayout from "../components/MainLayout";
import CopyButton from "../components/CopyButton";


export default function BlockExplorer() {
  const [blocks, setBlocks] = useState([]);
  const [latest, setLatest] = useState(0);
  const [loadedCount, setLoadedCount] = useState(10);
  const [activeTab, setActiveTab] = useState("blocks");
  const [copiedHash, setCopiedHash] = useState("");

  useEffect(() => {
    const fetchInitial = async () => {
      const latestBlock = await getLatestBlockNumber();
      setLatest(latestBlock);
      await loadBlocks(latestBlock, loadedCount, true);
    };
    fetchInitial();
  }, []);

  const loadBlocks = async (from, count, replace = false) => {
    const newBlocks = [];
    for (let i = 0; i < count; i++) {
      const blockNumber = from - i;
      if (blockNumber < 0) break;
      const block = await getBlockByNumber(blockNumber);
      if (block) newBlocks.push(block);
    }

    setBlocks((prev) => {
      const all = replace ? newBlocks : [...prev, ...newBlocks];
      const unique = Array.from(new Map(all.map((b) => [b.hash, b])).values());
      return unique.sort(
        (a, b) => parseInt(b.number, 16) - parseInt(a.number, 16)
      );
    });
  };

  const handleLoadMore = async () => {
    const lastBlockNumber = blocks[blocks.length - 1]
      ? parseInt(blocks[blocks.length - 1].number, 16)
      : latest;
    await loadBlocks(lastBlockNumber - 1, 10);
    setLoadedCount((prev) => prev + 10);
  };

  const handleCopy = (hash) => {
    navigator.clipboard.writeText(hash);
    setCopiedHash(hash);
    setTimeout(() => setCopiedHash(""), 1200);
  };

  return (
    <MainLayout >
      <h1 className="text-3xl font-bold text-white mb-6">Explorador de Bloques</h1>
      <div className="w-full bg-[#0d1117] rounded-xl border border-[#30363d] overflow-hidden">
        {/* Encabezado */}
        <div className="grid grid-cols-12 bg-[#161b22] text-white px-6 py-3 font-semibold border-b border-[#30363d]">
          <div className="col-span-1"># Bloque</div>
          <div className="col-span-8">Hash</div>
          <div className="col-span-1 text-center">TXs</div>
          <div className="col-span-2 text-right">Timestamp</div>
        </div>

        {/* Filas */}
        {blocks.map((block) => (
          <div
            key={block.hash}
            className="grid grid-cols-12 items-center px-6 py-3 border-b border-[#30363d] hover:bg-[#1e242c] transition-all"
          >
            {/* # Bloque */}
            <div className="col-span-1 flex items-center gap-2 font-mono text-white">
              <Cuboid size={16} className="text-white" />
              {parseInt(block.number, 16)}
            </div>

            {/* Hash + copiar */}
            <div className="col-span-7 flex items-center gap-3 overflow-hidden">
              <Link
                to={`/block/${parseInt(block.number, 16)}`}
                className="text-blue-400 hover:underline truncate"
              >
                {block.hash}
              </Link>
            </div>

            <div className="col-span-1 flex items-center justify-center relative">
            <CopyButton textToCopy={block.hash} />
            </div>

            {/* TXs */}
            <div className="col-span-1 text-center text-sm">
              <span className="text-teal-400 font-semibold">
                {block.transactions?.length || 0}
              </span>
            </div>

            {/* Timestamp */}
            <div className="col-span-2 text-right text-sm text-gray-400">
              {block.timestamp
                ? new Date(
                    parseInt(block.timestamp, 16) * 1000
                  ).toLocaleString()
                : "—"}
            </div>
          </div>
        ))}
      </div>

      {/* Botón para cargar más */}
      {blocks.length > 0 &&
        parseInt(blocks[blocks.length - 1].number, 16) > 0 && (
          <div className="flex justify-center mt-6">
            <button
              onClick={handleLoadMore}
              className="bg-blue-600 hover:bg-blue-700 text-black font-semibold px-6 py-2 rounded-md shadow transition"
            >
              Cargar más bloques
            </button>
          </div>
        )}
    </MainLayout>
  );
}

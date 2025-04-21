import React, { useEffect, useState } from "react";
import { getBlockByNumber, getTransactionByHash, getLatestBlockNumber } from "../utils/rpcClient";
import { Repeat, ClipboardCopy, Check } from "lucide-react";
import { Link } from "react-router-dom";
import MainLayout from "../components/MainLayout";
import CopyButton from "../components/CopyButton";

export default function TransactionExplorer() {
  const [transactions, setTransactions] = useState([]); // Store unique transactions
  const [latestBlock, setLatestBlock] = useState(0); // Store latest block number
  const [nextBlockNumber, setNextBlockNumber] = useState(null); // Next block number to load
  const [loading, setLoading] = useState(false); // Flag to show loading indicator
  const [hasMore, setHasMore] = useState(true); // Flag to indicate if there are more transactions to load
  const [copiedHash, setCopiedHash] = useState(""); // State for copied hash

  // Fetch the latest block on initial render
  useEffect(() => {
    const fetchInitial = async () => {
      const latest = await getLatestBlockNumber();
      setLatestBlock(latest);
      setNextBlockNumber(latest); // Set initial block to start loading
      await loadTransactions(latest, 10, true); // Load first 10 transactions from the latest block
    };
    fetchInitial();
  }, []);

  // Function to load transactions from blocks
  const loadTransactions = async (fromBlock, count, replace = false) => {
    setLoading(true);
    let txs = [];
    let blockNumber = fromBlock;

    // Loop through blocks to get transactions
    while (txs.length < count && blockNumber > 0) {
      const block = await getBlockByNumber(blockNumber);
      if (block && block.transactions) {
        for (const txHash of block.transactions) {
          const tx = await getTransactionByHash(txHash);
          if (tx && !transactions.some((existingTx) => existingTx.hash === tx.hash)) {
            tx.timestamp = block.timestamp;
            txs.push(tx);
            if (txs.length >= count) break;
          }
        }
      }
      blockNumber -= 1; // Go to the previous block
    }

    // Add new transactions to state and avoid duplicates
    setTransactions((prev) => {
      const allTxs = replace ? txs : [...prev, ...txs];
      return allTxs;
    });

    setNextBlockNumber(blockNumber); // Update the next block number

    // Determine if there are more transactions to load
    if (blockNumber <= 0) {
      setHasMore(false); // No more blocks left to load
    }
    setLoading(false);
  };

  // Handle loading more transactions
  const handleLoadMore = async () => {
    if (!nextBlockNumber || nextBlockNumber <= 0 || loading) return;
    await loadTransactions(nextBlockNumber, 10); // Load more transactions
  };

  // Handle copying the transaction hash
  const handleCopy = (hash) => {
    navigator.clipboard.writeText(hash);
    setCopiedHash(hash);
    setTimeout(() => setCopiedHash(""), 1200);
  };

  return (
    <MainLayout>
        <h1 className="text-3xl font-bold text-white mb-6">Explorador de Transacciones</h1>
      <div className="w-full bg-[#0d1117] rounded-xl border border-[#30363d] overflow-hidden">
        {/* Encabezado */}
        <div className="grid grid-cols-12 bg-[#161b22] text-white px-6 py-3 font-semibold border-b border-[#30363d]">
          <div className="col-span-4">TX Hash</div>
          <div className="col-span-3 text-center">From</div>
          <div className="col-span-3 text-center">To</div>
          <div className="col-span-2 text-center">Timestamp</div>
        </div>

        {/* Transacciones */}
        {transactions.map((tx) => (
          <div
            key={tx.hash}
            className="grid grid-cols-12 items-center px-6 py-3 border-b border-[#30363d] hover:bg-[#1e242c] transition-all"
          >
            {/* TX Hash */}
            <div className="col-span-3 flex items-center gap-2 font-mono text-white">
              <Repeat size={16} className="text-white" />
              <Link
                to={`/tx/${tx.hash}`}
                className="text-blue-400 hover:underline truncate"
              >
                {tx.hash}
              </Link>
            </div>

            {/* Copy Button */}
            <div className="col-span-1 flex items-center justify-center relative">
              <CopyButton textToCopy={tx.hash} />
            </div>

            {/* From */}
            <div className="col-span-3 text-center">
              <span className="text-teal-400">{tx.from}</span>
            </div>

            {/* To */}
            <div className="col-span-3 text-center">
              <span className="text-teal-400">{tx.to}</span>
            </div>

            {/* Timestamp */}
            <div className="col-span-2 text-center text-sm text-gray-400">
              {tx.timestamp
                ? new Date(parseInt(tx.timestamp, 16) * 1000).toLocaleString()
                : "—"}
            </div>

          </div>
        ))}
      </div>

      {/* Botón para cargar más */}
      {hasMore && (
        <div className="flex justify-center mt-6">
          <button
            onClick={handleLoadMore}
            className="bg-blue-600 hover:bg-blue-700 text-black font-semibold px-6 py-2 rounded-md shadow transition"
            disabled={loading}
          >
            {loading ? "Cargando..." : "Cargar más transacciones"}
          </button>
        </div>
      )}
    </MainLayout>
  );
}

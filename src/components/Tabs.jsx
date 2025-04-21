import React from "react";
import { useNavigate, useLocation, useMatch } from "react-router-dom";
import { Route, Box, Repeat } from "lucide-react";

export default function Tabs() {
  const navigate = useNavigate();
  
  // Usamos useMatch para comprobar si estamos en la ruta correspondiente
  const matchTraceability = useMatch("/");
  const matchBlocks = useMatch("/blocks");
  const matchTransactions = useMatch("/transactions");
  const matchProduct = useMatch("/product/:id");
  const matchTxHash = useMatch("/tx/:hash");
  const matchBlockHash = useMatch("/block/:blockNumber");

  // Determinamos el tab activo según las rutas
  const getActiveTab = () => {
    if (matchBlocks || matchBlockHash) return "blocks"; // Si estamos en la ruta de Blocks
    if (matchTransactions || matchTxHash) return "txs"; // Si estamos en transacciones o con hash
    if (matchProduct) return "traceability"; // Si estamos en la página de producto
    return "traceability"; // Página principal
  };

  const activeTab = getActiveTab();

  const tabs = [
    {
      label: "Trazabilidad",
      path: "/",
      icon: (
        <span className="group-hover:rotate-[25deg] group-hover:scale-130 transition-transform duration-500 ease-out">
          <Route size={18} />
        </span>
      ),
      value: "traceability",
    },
    {
      label: "Blocks",
      path: "/blocks",
      icon: (
        <span className="group-hover:rotate-[25deg] group-hover:scale-130 transition-transform duration-500 ease-out">
          <Box size={18} />
        </span>
      ),
      value: "blocks",
    },
    {
      label: "TXs",
      path: "/transactions",
      icon: (
        <span className=" group-hover:rotate-[25deg] group-hover:scale-130 transition-transform duration-500 ease-out">
          <Repeat size={18} />
        </span>
      ),
      value: "txs",
    },
  ];

  return (
    <div className="flex justify-center space-x-4">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.value;
        return (
          <button
            key={tab.path}
            onClick={() => navigate(tab.path)}
            className={`group flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl border border-[#30363d] transition-all duration-200 transform ${
              isActive
                ? "bg-blue-500 text-green-900"
                : "bg-[#161b22] text-gray-500 hover:text-black"
            }`}
          >
            <span
              className={`inline-block transform transition-transform duration-500 ease-out group-hover:scale-110 ${
                isActive ? "rotate-[25deg] scale-125" : ""
              }`}
            >
              {tab.icon}
            </span>
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}

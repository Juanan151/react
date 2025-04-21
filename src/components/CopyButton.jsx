import { Copy, Check } from "lucide-react";
import React, { useState } from "react";

export default function CopyButton({ textToCopy }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  return (
    <div className="relative flex flex-col items-center justify-center">
      <button
        onClick={handleCopy}
        className={`p-2 rounded-md bg-gray-100 hover:bg-white transition-all duration-200 shadow
          ${copied ? "scale-105 bg-green-300" : ""}`}
        title="Copiar"
      >
        {copied ? (
          <Check size={18} className="text-green-800 transition" />
        ) : (
          <Copy size={18} className="text-black transition" />
        )}
      </button>

      {copied && (
        <span className="absolute -bottom-6 text-xs bg-green-600 text-white font-semibold px-2 py-0.5 rounded shadow animate-fade-in">
          ¡Copiado!
        </span>
      )}
    </div>
  );
}

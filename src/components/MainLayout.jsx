// components/MainLayout.jsx
import React from "react";
import Tabs from "./Tabs";
import { Link } from "react-router-dom";

export default function MainLayout({ children }) {
  return (
    <div className="min-h-screen bg-[#1c1f26] text-white font-sans p-4 w-screen">
      <div className="w-full space-y-6 px-4 lg:px-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 border-b border-white/10 pb-2">
          <Link to="/" className="group inline-block">
            <img
              src="/logo.jpg"
              alt="TBI Logo"
              className="rounded-xl border border-[#30363d] h-11 w-auto object-contain transition-transform duration-300 group-hover:scale-102"
            />
          </Link>

          <Tabs />
        </div>

        {/* Contenido */}
        {children}
      </div>
    </div>
  );
}

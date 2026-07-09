"use client";

import { useState, useEffect } from "react";
import { useStore } from "@/lib/store";
import Header from "@/components/cf/Header";
import HeroSection from "@/components/cf/HeroSection";
import ToolGrid from "@/components/cf/ToolGrid";
import ToolWorkspace from "@/components/cf/ToolWorkspace";
import CrossPromo from "@/components/cf/CrossPromo";
import PricingSection from "@/components/cf/PricingSection";
import AdBanner from "@/components/cf/AdBanner";
import Footer from "@/components/cf/Footer";
import CheckoutModal from "@/components/cf/CheckoutModal";
import { getRecentTools } from "@/lib/usage-counter";
import { tools } from "@/lib/tool-definitions";

export default function Home() {
  const { currentView, setView, setActiveTool, setCheckoutOpen, checkoutOpen } =
    useStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [recentToolIds, setRecentToolIds] = useState<string[]>([]);

  useEffect(() => {
    setRecentToolIds(getRecentTools(4));
  }, [currentView]);

  const handleToolClick = (id: string) => {
    setActiveTool(id);
    setView("workspace");
  };

  const handleGoPro = () => {
    setCheckoutOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "linear-gradient(180deg, #0c0c14 0%, #141422 100%)" }}>
      <Header onGoPro={handleGoPro} />

      <main className="flex-1">
        {currentView === "home" ? (
          <>
            <HeroSection
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
            />
            <AdBanner label="hero-bottom" />
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
              <ToolGrid
                searchQuery={searchQuery}
                onToolClick={handleToolClick}
              />
            </section>

            {/* Recently Used */}
            {recentToolIds.length > 0 && (
              <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
                <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">
                  Recently Used
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {recentToolIds.map((toolId) => {
                    const recentTool = tools.find((t) => t.id === toolId);
                    if (!recentTool) return null;
                    return (
                      <button
                        key={toolId}
                        onClick={() => handleToolClick(toolId)}
                        className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.06] hover:border-amber-500/20 transition-all text-left group"
                      >
                        <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-lg flex-shrink-0 ${recentTool.gradient}`}>
                          {recentTool.icon}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-medium text-slate-200 group-hover:text-white truncate transition-colors">
                            {recentTool.name}
                          </p>
                          <p className="text-[10px] text-slate-500 truncate">
                            {recentTool.category}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </section>
            )}

            <AdBanner label="mid-content" />
            <PricingSection onGoPro={handleGoPro} />
            <CrossPromo exclude="ConvertFlow" />
            <AdBanner label="pre-footer" />
          </>
        ) : (
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <ToolWorkspace />
          </div>
        )}
      </main>
      <Footer />

      <CheckoutModal
        isOpen={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
      />
    </div>
  );
}
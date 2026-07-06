"use client";

import { useState } from "react";
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

export default function Home() {
  const { currentView, setView, setActiveTool, setCheckoutOpen, checkoutOpen } =
    useStore();
  const [searchQuery, setSearchQuery] = useState("");

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
            <AdBanner label="mid-content" />
            <PricingSection onGoPro={handleGoPro} />
            <CrossPromo />
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
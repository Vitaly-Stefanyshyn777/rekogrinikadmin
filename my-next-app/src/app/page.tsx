import React from "react";
import { HeroSection } from "@/components/HeroSection";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <HeroSection />

        <div className="mt-12 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Наші послуги
          </h2>
          <p className="text-gray-600">
            Повна реконструкція квартир та будинків у Празі
          </p>
        </div>
      </div>
    </div>
  );
}

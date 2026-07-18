import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import Stats from "@/components/landing/Stats";
import Features from "@/components/landing/Features";
import DashboardPreview from "@/components/landing/DashboardPreview";
import AISection from "@/components/landing/AISection";
import TechStack from "@/components/landing/TechStack";
import Workflow from "@/components/landing/Workflow";
import FAQ from "@/components/landing/FAQ";
import CTA from "@/components/landing/CTA";
import Footer from "@/components/landing/Footer";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#020617]">
      <Navbar />
      <Hero />
      <Stats />
      <Features />
      <DashboardPreview />
      <AISection />
      <TechStack />
      <Workflow />
      <FAQ />
      <CTA />
      <Footer />
    </main>
  );
}

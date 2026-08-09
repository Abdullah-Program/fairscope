import Navbar from "../components/landing/Navbar";
import Hero from "../components/landing/Hero";
import HowItWorks from "../components/landing/HowItWorks";
import CaseFilePreview from "../components/landing/CaseFilePreview";
import Features from "../components/landing/Features";
import FooterCTA from "../components/landing/FooterCTA";

export default function LandingPage() {
  return (
    <div className="relative min-h-screen bg-base-950 overflow-x-hidden">
      <Navbar />
      <Hero />
      <HowItWorks />
      <CaseFilePreview />
      <Features />
      <FooterCTA />
    </div>
  );
}

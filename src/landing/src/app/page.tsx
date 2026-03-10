import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import ProblemStats from "@/components/ProblemStats";
import HowItWorks from "@/components/HowItWorks";
import Features from "@/components/Features";
import Integrations from "@/components/Integrations";
import Pricing from "@/components/Pricing";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <ProblemStats />
        <HowItWorks />
        <Features />
        <Integrations />
        <Pricing />
      </main>
      <Footer />
    </>
  );
}

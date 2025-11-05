import {
  HeaderNavigasi,
  HeroSection,
  FiturSection,
  ProsesPenerbitanSection,
  TestimoniSection,
  CTASection,
  Footer,
} from "@/components/landing";

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <HeaderNavigasi />
      <main>
        <HeroSection />
        <FiturSection />
        <ProsesPenerbitanSection />
        <TestimoniSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}

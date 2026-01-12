import {
  HeaderNavigasi,
  HeroSection,
  FiturSection,
  BukuUnggulanSection,
  ProsesPenerbitanSection,
  TestimoniSection,
  MobileAppSection,
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
        <BukuUnggulanSection />
        <ProsesPenerbitanSection />
        <TestimoniSection />
        <MobileAppSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}

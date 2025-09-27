import Header from '@/components/Header';
import Hero from '@/components/Hero';
import Features from '@/components/Features';
import Workflow from '@/components/Workflow';

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <Hero />
      <Features />
      <Workflow />
    </div>
  );
}

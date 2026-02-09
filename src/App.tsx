import { useCallback } from 'react';
import { Navbar } from '@/sections/Navbar';
import { Hero } from '@/sections/Hero';
import { Generator } from '@/sections/Generator';
import { Features } from '@/sections/Features';
import { Footer } from '@/sections/Footer';

function App() {
  const scrollToGenerator = useCallback(() => {
    const generatorSection = document.getElementById('generator');
    if (generatorSection) {
      generatorSection.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* Content */}
      <Navbar onTryNowClick={scrollToGenerator} />
      <main>
        <Hero onTryNowClick={scrollToGenerator} />
        <Generator />
        <Features />
      </main>
      <Footer />
    </div>
  );
}

export default App;

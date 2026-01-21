import React, { useState } from 'react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { Services } from './components/Services';
import { Testimonials } from './components/Testimonials';
import { Footer } from './components/Footer';
import { QuoteModal } from './components/QuoteModal';

function App() {
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);

  const openQuote = () => setIsQuoteModalOpen(true);
  const closeQuote = () => setIsQuoteModalOpen(false);

  return (
    <div className="bg-brand-dark min-h-screen text-white font-sans selection:bg-brand-yellow selection:text-brand-dark">
      <Header onOpenQuote={openQuote} />
      
      <main>
        <Hero onOpenQuote={openQuote} />
        <Services />
        
        {/* Value Prop Section */}
        <section id="process" className="py-24 bg-brand-yellow text-neutral-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row gap-12 items-center">
              <div className="flex-1">
                <h2 className="text-4xl md:text-5xl font-display font-bold uppercase mb-6">How It Works</h2>
                <div className="space-y-8">
                  {[
                    { step: "01", title: "Book Online", desc: "Use our AI-powered quote tool or give us a call to schedule." },
                    { step: "02", title: "Upfront Quote", desc: "We arrive, assess the junk, and give you a guaranteed price." },
                    { step: "03", title: "We Haul It", desc: "We load everything up and sweep the area clean before we leave." }
                  ].map((item) => (
                    <div key={item.step} className="flex gap-6">
                      <span className="text-5xl font-display font-bold text-neutral-900/20">{item.step}</span>
                      <div>
                        <h4 className="text-xl font-bold uppercase mb-2">{item.title}</h4>
                        <p className="font-medium text-neutral-800/80 max-w-sm">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex-1">
                 <div className="bg-neutral-900 p-8 rounded-2xl shadow-2xl text-white transform rotate-2">
                    <h3 className="font-display font-bold text-3xl mb-4 uppercase text-brand-yellow">Lex Hobbs</h3>
                    <p className="text-gray-300 italic mb-6">
                      "My goal is simple: to make your junk disappear without you lifting a finger. We built this business in Moncks Corner on honesty, hard work, and fair pricing."
                    </p>
                    <div className="h-1 w-full bg-neutral-800 rounded mb-4">
                      <div className="h-full w-1/3 bg-brand-yellow rounded"></div>
                    </div>
                    <p className="text-sm font-bold uppercase tracking-wider">Owner & Operator</p>
                 </div>
              </div>
            </div>
          </div>
        </section>

        <Testimonials />
      </main>

      <Footer />

      <QuoteModal isOpen={isQuoteModalOpen} onClose={closeQuote} />
    </div>
  );
}

export default App;
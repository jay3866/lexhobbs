import React from 'react';
import { ArrowRight, Star, Upload } from 'lucide-react';
import { Button } from './Button';

interface HeroProps {
  onOpenQuote: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onOpenQuote }) => {
  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-neutral-900 pt-20">
      
      {/* Background Elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-r from-neutral-900 via-neutral-900/90 to-neutral-900/40 z-10" />
        {/* Placeholder for a real truck image or junk removal action shot */}
        <img 
          src="https://images.unsplash.com/photo-1532323544230-7191fd510c59?q=80&w=2000&auto=format&fit=crop" 
          alt="Junk Removal Truck" 
          className="w-full h-full object-cover opacity-50"
        />
      </div>

      {/* Diagonal Design Element (Matches card) */}
      <div className="absolute bottom-0 right-0 w-1/2 h-full bg-brand-yellow/10 transform -skew-x-12 translate-x-1/4 z-0 pointer-events-none" />
      <div className="absolute top-0 right-0 w-64 h-full bg-brand-yellow/5 transform skew-x-12 translate-x-1/2 z-0 pointer-events-none" />

      <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center gap-12">
        
        {/* Text Content */}
        <div className="flex-1 text-center md:text-left">
          <div className="inline-flex items-center gap-2 bg-neutral-800/80 backdrop-blur border border-neutral-700 rounded-full px-4 py-1.5 mb-6">
            <div className="flex text-brand-yellow">
              {[...Array(5)].map((_, i) => <Star key={i} size={14} fill="currentColor" />)}
            </div>
            <span className="text-xs font-bold text-white uppercase tracking-wider">Top Rated in Moncks Corner</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-display font-bold text-white leading-tight mb-6 uppercase">
            We Haul It <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-yellow to-yellow-200">All Away</span>
          </h1>
          
          <p className="text-lg text-gray-300 mb-8 max-w-xl mx-auto md:mx-0 leading-relaxed">
            Professional junk removal and hauling in Moncks Corner, SC. 
            Residential & Commercial. Fast, friendly, and affordable.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4 justify-center md:justify-start">
            <Button onClick={onOpenQuote} className="h-14 px-8 text-lg w-full sm:w-auto shadow-[0_0_20px_rgba(255,215,0,0.3)]">
              Get Instant Quote <ArrowRight className="ml-2" />
            </Button>
            <Button variant="outline" onClick={onOpenQuote} className="h-14 w-full sm:w-auto border-neutral-600 text-gray-300 hover:text-brand-dark hover:border-brand-yellow">
              <Upload className="mr-2" size={20} /> Upload Photo
            </Button>
          </div>
        </div>

        {/* Hero Card / Feature Block */}
        <div className="hidden lg:block w-96">
            <div className="bg-neutral-800/50 backdrop-blur-md border border-neutral-700 p-8 rounded-2xl shadow-2xl relative transform rotate-3 hover:rotate-0 transition-all duration-300">
                <div className="absolute -top-4 -right-4 w-20 h-20 bg-brand-yellow rounded-full flex items-center justify-center font-display font-bold text-xl text-brand-dark shadow-lg animate-bounce">
                    FREE<br/>EST
                </div>
                <h3 className="font-display text-2xl text-white mb-4 uppercase">Why Choose Hobbs?</h3>
                <ul className="space-y-4">
                    {[
                        "Locally Owned & Operated",
                        "Same-Day Service Available",
                        "Eco-Friendly Disposal",
                        "Upfront Pricing - No Hidden Fees"
                    ].map((item, i) => (
                        <li key={i} className="flex items-center gap-3 text-gray-300">
                            <div className="w-6 h-6 rounded-full bg-brand-yellow/20 flex items-center justify-center text-brand-yellow">
                                <ArrowRight size={14} />
                            </div>
                            {item}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
      </div>
    </div>
  );
};
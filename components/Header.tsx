import React, { useState, useEffect } from 'react';
import { Menu, X, Phone, Facebook } from 'lucide-react';
import { Button } from './Button';
import { CONTACT_INFO } from '../types';

interface HeaderProps {
  onOpenQuote: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenQuote }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Services', href: '#services' },
    { name: 'Our Work', href: '#gallery' },
    { name: 'How It Works', href: '#process' },
    { name: 'Reviews', href: '#reviews' },
    { name: 'Contact', href: '#footer' },
  ];

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        isScrolled ? 'bg-neutral-900/95 backdrop-blur-md shadow-lg py-3' : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-brand-yellow transform -skew-x-12 flex items-center justify-center border-2 border-white">
               <span className="font-display font-bold text-xl text-neutral-900 transform skew-x-12">H</span>
            </div>
            <div className="flex flex-col">
              <span className="font-display font-bold text-xl text-white tracking-wide leading-none">HOBBS</span>
              <span className="text-[10px] text-brand-yellow font-bold tracking-[0.2em] uppercase leading-none">Junk Removal & Hauling</span>
            </div>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a 
                key={link.name} 
                href={link.href} 
                className="text-sm font-medium text-gray-300 hover:text-brand-yellow transition-colors uppercase tracking-wider"
              >
                {link.name}
              </a>
            ))}
          </nav>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-4">
            <a href={`tel:${CONTACT_INFO.phone}`} className="flex items-center gap-2 text-white hover:text-brand-yellow transition-colors">
              <div className="bg-neutral-800 p-2 rounded-full">
                <Phone size={16} />
              </div>
              <span className="font-bold font-display tracking-wide">{CONTACT_INFO.phone}</span>
            </a>
            <Button onClick={onOpenQuote} className="text-sm py-2 px-4">
              Get Quote
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden text-white p-2"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-neutral-900 border-t border-neutral-800 p-4 shadow-xl">
          <nav className="flex flex-col space-y-4">
            {navLinks.map((link) => (
              <a 
                key={link.name} 
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-gray-300 hover:text-brand-yellow font-medium py-2 border-b border-neutral-800"
              >
                {link.name}
              </a>
            ))}
            <div className="pt-4 flex flex-col gap-3">
              <a href={`tel:${CONTACT_INFO.phone}`} className="flex items-center justify-center gap-2 text-white font-bold bg-neutral-800 py-3 rounded">
                <Phone size={18} /> Call Now
              </a>
              <Button fullWidth onClick={() => {
                setIsMobileMenuOpen(false);
                onOpenQuote();
              }}>
                Get Free Estimate
              </Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};
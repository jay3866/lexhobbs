import React from 'react';
import { Facebook, Mail, MapPin, Phone } from 'lucide-react';
import { CONTACT_INFO } from '../types';

export const Footer: React.FC = () => {
  return (
    <footer id="footer" className="bg-black text-white pt-20 pb-10 border-t border-neutral-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-16">
          
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 bg-brand-yellow transform -skew-x-12 flex items-center justify-center border border-white">
                   <span className="font-display font-bold text-lg text-neutral-900 transform skew-x-12">H</span>
                </div>
                <span className="font-display font-bold text-2xl tracking-wide">HOBBS</span>
            </div>
            <p className="text-gray-400 mb-6 max-w-sm">
              Professional junk removal and hauling services in Moncks Corner, SC and surrounding areas. Licensed & Insured.
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 rounded-full bg-neutral-900 flex items-center justify-center text-gray-400 hover:bg-brand-yellow hover:text-black transition-all">
                <Facebook size={20} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-display font-bold text-lg uppercase mb-6 text-brand-yellow">Quick Links</h4>
            <ul className="space-y-3">
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Home</a></li>
              <li><a href="#services" className="text-gray-400 hover:text-white transition-colors">Services</a></li>
              <li><a href="#reviews" className="text-gray-400 hover:text-white transition-colors">Reviews</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Get Quote</a></li>
              <li><a href="#/privacy" className="text-gray-400 hover:text-white transition-colors">Privacy Policy</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-display font-bold text-lg uppercase mb-6 text-brand-yellow">Contact Us</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin className="text-brand-yellow shrink-0 mt-1" size={18} />
                <span className="text-gray-300">{CONTACT_INFO.location}</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="text-brand-yellow shrink-0" size={18} />
                <a href={`tel:${CONTACT_INFO.phone}`} className="text-gray-300 hover:text-white">{CONTACT_INFO.phone}</a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="text-brand-yellow shrink-0" size={18} />
                <a href={`mailto:${CONTACT_INFO.email}`} className="text-gray-300 hover:text-white">{CONTACT_INFO.email}</a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-neutral-800 pt-8 text-center text-sm text-gray-500">
          <p>&copy; {new Date().getFullYear()} Hobbs Junk Removal & Hauling LLC. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};
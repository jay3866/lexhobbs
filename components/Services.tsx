import React from 'react';
import { Sofa, Construction, Recycle, Tv, Trash2, Warehouse } from 'lucide-react';
import { ServiceItem } from '../types';

const services: ServiceItem[] = [
  {
    id: 'furniture',
    title: 'Furniture Removal',
    description: 'We haul away old sofas, mattresses, chairs, tables, and more.',
    icon: <Sofa size={32} />
  },
  {
    id: 'construction',
    title: 'Construction Debris',
    description: 'Cleanup for renovations, remodeling scraps, lumber, and drywall.',
    icon: <Construction size={32} />
  },
  {
    id: 'appliances',
    title: 'Appliance Recycling',
    description: 'Safe removal of refrigerators, washers, dryers, and old stoves.',
    icon: <Recycle size={32} />
  },
  {
    id: 'electronics',
    title: 'E-Waste Disposal',
    description: 'Responsible disposal of TVs, computers, monitors, and printers.',
    icon: <Tv size={32} />
  },
  {
    id: 'cleanouts',
    title: 'Estate Cleanouts',
    description: 'Full house, garage, attic, and basement cleanout services.',
    icon: <Warehouse size={32} />
  },
  {
    id: 'general',
    title: 'General Junk',
    description: 'Yard waste, household trash, and anything else you need gone.',
    icon: <Trash2 size={32} />
  }
];

export const Services: React.FC = () => {
  return (
    <section id="services" className="py-24 bg-neutral-900 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center mb-16">
          <h2 className="text-brand-yellow font-display font-bold tracking-[0.2em] uppercase text-sm mb-3">Our Services</h2>
          <h3 className="text-4xl md:text-5xl font-display font-bold text-white uppercase">What We Haul</h3>
          <div className="w-24 h-1 bg-brand-yellow mx-auto mt-6"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => (
            <div 
              key={service.id}
              className="group relative bg-neutral-800 border border-neutral-700 p-8 rounded-xl overflow-hidden hover:border-brand-yellow transition-colors duration-300"
            >
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity transform group-hover:scale-110 duration-500">
                {service.icon}
              </div>
              
              <div className="w-14 h-14 bg-neutral-900 rounded-lg flex items-center justify-center text-brand-yellow mb-6 shadow-lg group-hover:bg-brand-yellow group-hover:text-neutral-900 transition-colors duration-300">
                {service.icon}
              </div>
              
              <h4 className="text-xl font-bold text-white mb-3 font-display uppercase">{service.title}</h4>
              <p className="text-gray-400 leading-relaxed group-hover:text-gray-300 transition-colors">
                {service.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
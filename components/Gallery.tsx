import React, { useState } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

const galleryItems = [
  { src: '/images/work/1000014387.jpg', caption: 'Property Cleanout — Before & After' },
  { src: '/images/work/1000015719.jpg', caption: 'Shed Demolition — Before' },
  { src: '/images/work/1000015721.jpg', caption: 'Shed Demolition — In Progress' },
  { src: '/images/work/1000015722.jpg', caption: 'Shed Demolition — Teardown' },
  { src: '/images/work/1000015724.jpg', caption: 'Shed Demolition — Clean Site' },
  { src: '/images/work/1000016137.jpg', caption: 'Excavator — Structure Removal' },
  { src: '/images/work/1000016135.jpg', caption: 'Skid Steer Loading Dumpster' },
  { src: '/images/work/1000014127.jpg', caption: 'Full Load Ready for Hauling' },
  { src: '/images/work/1000015472.jpg', caption: 'On-Site Junk Removal' },
  { src: '/images/work/1000016120.jpg', caption: 'Dump Trailer in Action' },
  { src: '/images/work/1000014126.jpg', caption: 'Curbside Pickup — HVAC & Debris' },
  { src: '/images/work/1000016122.jpg', caption: 'Our Heavy-Duty Dump Trailer' },
];

export const Gallery: React.FC = () => {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const openLightbox = (index: number) => setLightboxIndex(index);
  const closeLightbox = () => setLightboxIndex(null);
  const nextImage = () => setLightboxIndex(i => i !== null ? (i + 1) % galleryItems.length : null);
  const prevImage = () => setLightboxIndex(i => i !== null ? (i - 1 + galleryItems.length) % galleryItems.length : null);

  return (
    <section id="gallery" className="py-24 bg-neutral-900 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="text-center mb-16">
          <h2 className="text-brand-yellow font-display font-bold tracking-[0.2em] uppercase text-sm mb-3">Our Work</h2>
          <h3 className="text-4xl md:text-5xl font-display font-bold text-white uppercase">See The Results</h3>
          <div className="w-24 h-1 bg-brand-yellow mx-auto mt-6"></div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
          {galleryItems.map((item, i) => (
            <button
              key={i}
              onClick={() => openLightbox(i)}
              className="group relative aspect-square overflow-hidden rounded-xl bg-neutral-800 cursor-pointer"
            >
              <img
                src={item.src}
                alt={item.caption}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <p className="text-white text-sm font-medium">{item.caption}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center" onClick={closeLightbox}>
          <button
            onClick={(e) => { e.stopPropagation(); closeLightbox(); }}
            className="absolute top-4 right-4 z-50 w-10 h-10 rounded-full bg-neutral-800/80 flex items-center justify-center text-white hover:bg-neutral-700 transition-colors"
          >
            <X size={24} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); prevImage(); }}
            className="absolute left-4 z-50 w-12 h-12 rounded-full bg-neutral-800/80 flex items-center justify-center text-white hover:bg-neutral-700 transition-colors"
          >
            <ChevronLeft size={28} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); nextImage(); }}
            className="absolute right-4 z-50 w-12 h-12 rounded-full bg-neutral-800/80 flex items-center justify-center text-white hover:bg-neutral-700 transition-colors"
          >
            <ChevronRight size={28} />
          </button>
          <div className="max-w-5xl max-h-[85vh] px-16" onClick={(e) => e.stopPropagation()}>
            <img
              src={galleryItems[lightboxIndex].src}
              alt={galleryItems[lightboxIndex].caption}
              className="max-w-full max-h-[80vh] object-contain rounded-lg"
            />
            <p className="text-white text-center mt-4 font-medium">{galleryItems[lightboxIndex].caption}</p>
          </div>
        </div>
      )}
    </section>
  );
};

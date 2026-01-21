import React from 'react';
import { Star, Quote } from 'lucide-react';

export const Testimonials: React.FC = () => {
  return (
    <section id="reviews" className="py-24 bg-neutral-800 relative overflow-hidden">
        {/* Decorative Angled Background */}
        <div className="absolute inset-0 bg-neutral-900 transform -skew-y-3 origin-top-left -z-0 translate-y-20"></div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-brand-yellow font-display font-bold tracking-[0.2em] uppercase text-sm mb-3">Testimonials</h2>
          <h3 className="text-4xl font-display font-bold text-white uppercase">Client Reviews</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              text: "Lex and his team were amazing. They cleared out my garage in under an hour. Super professional and the price was exactly what they quoted.",
              author: "Sarah J.",
              location: "Moncks Corner"
            },
            {
              text: "Best hauling service in SC. I uploaded a picture, got a quote, and they were here the next day. The truck is huge!",
              author: "Mike T.",
              location: "Goose Creek"
            },
            {
              text: "Highly recommend Hobbs Junk Removal. Very polite, respectful of my property, and they even swept up afterwards.",
              author: "Amanda R.",
              location: "Summerville"
            }
          ].map((review, i) => (
            <div key={i} className="bg-neutral-900 p-8 rounded-2xl border border-neutral-700 relative">
              <Quote className="absolute top-6 right-6 text-neutral-800" size={48} />
              <div className="flex text-brand-yellow mb-4">
                {[...Array(5)].map((_, j) => <Star key={j} size={16} fill="currentColor" />)}
              </div>
              <p className="text-gray-300 mb-6 relative z-10">"{review.text}"</p>
              <div>
                <p className="font-bold text-white">{review.author}</p>
                <p className="text-sm text-gray-500">{review.location}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
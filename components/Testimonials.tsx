import React, { useState } from 'react';
import { Star, Quote, ChevronLeft, ChevronRight } from 'lucide-react';

const reviews = [
  {
    text: "Mr. Hobbs and his team did an amazing job. They cleaned out my 5 years packed up garage quickly, I was able to navigate and let them know what to keep and what was going they were kind and professional during the entire process. I will definitely be referring them and using them again. Thank you so much.",
    author: "Joyce M.",
    date: "January 19",
    verified: true
  },
  {
    text: "I can't say enough good things about Hobbs Junk Removal & Hauling! They showed up the same day I called — on time, friendly, and ready to go, even though it was raining. They didn't miss a beat. The team safely removed my old appliances, worked quickly, and even cleaned up afterward. It's rare to find people who take that much pride in their work and treat your home and property with care. The pricing was fair, the communication was great, and the service went above and beyond. If you need anything hauled away — big or small — these are the folks to call. I'll definitely be using them again and recommending them to everyone I know!",
    author: "Josh J.",
    date: "November 8, 2025",
    verified: true
  },
  {
    text: "They responded quickly, showed up on time, got to work, no BS, got everything handled and cleaned all my junk up perfectly, hauled it all off - all good. Highly recommend and will use again. Totally worth it and extremely professional!",
    author: "Natalia W.",
    date: "August 30, 2025",
    verified: true
  },
  {
    text: "Quick painless in less than 30min from call to completion. I am so blessed to have stumbled upon you. I'm beyond grateful. It might seem like nothing to you but 8 months I been wanting to do this chore no one would help. THANK YOU... AND THIS OLE WOMAN WILL HAVE MORE AND I WILL RECOMMEND YOU TO OUR CHURCH FAMILY AT CALVARY CHAPEL SUMMERVILLE!!! YOU MADE MY DAY.",
    author: "Sharon H.",
    date: "July 16, 2025",
    verified: true
  },
  {
    text: "Lex was called on Wednesday to do an eviction the next day. He showed up on time Thursday morning and was patient. He did the job at a fair rate and was very considerate. He was on time and worked until he finished the job! He and Travis are a great team! They are very friendly and understanding. They showed compassion to people that stopped by while they worked. I would certainly hire them again!",
    author: "Simplicia S.",
    date: "May 8, 2025",
    verified: true
  }
];

export const Testimonials: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const visibleCount = 3;
  const maxIndex = reviews.length - visibleCount;

  const next = () => setCurrentIndex(i => Math.min(i + 1, maxIndex));
  const prev = () => setCurrentIndex(i => Math.max(i - 1, 0));

  return (
    <section id="reviews" className="py-24 bg-neutral-800 relative overflow-hidden">
      {/* Decorative Angled Background */}
      <div className="absolute inset-0 bg-neutral-900 transform -skew-y-3 origin-top-left -z-0 translate-y-20"></div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-brand-yellow font-display font-bold tracking-[0.2em] uppercase text-sm mb-3">Testimonials</h2>
          <h3 className="text-4xl font-display font-bold text-white uppercase">What Our Clients Say</h3>
          <p className="text-gray-400 mt-4 max-w-lg mx-auto">Real reviews from real customers across the Lowcountry.</p>
        </div>

        {/* Desktop: sliding cards */}
        <div className="hidden md:block relative">
          <div className="overflow-hidden">
            <div
              className="flex gap-8 transition-transform duration-500 ease-out"
              style={{ transform: `translateX(-${currentIndex * (100 / visibleCount)}%)` }}
            >
              {reviews.map((review, i) => (
                <div key={i} className="min-w-[calc(33.333%-1.35rem)] bg-neutral-900 p-8 rounded-2xl border border-neutral-700 relative flex flex-col">
                  <Quote className="absolute top-6 right-6 text-neutral-800" size={48} />
                  <div className="flex text-brand-yellow mb-4">
                    {[...Array(5)].map((_, j) => <Star key={j} size={16} fill="currentColor" />)}
                  </div>
                  <p className="text-gray-300 mb-6 relative z-10 flex-1 text-sm leading-relaxed">"{review.text}"</p>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold text-white">{review.author}</p>
                      <p className="text-sm text-gray-500">{review.date}</p>
                    </div>
                    {review.verified && (
                      <span className="text-xs text-green-500 font-medium bg-green-500/10 px-2 py-1 rounded">Verified</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation arrows */}
          {maxIndex > 0 && (
            <div className="flex justify-center gap-4 mt-8">
              <button
                onClick={prev}
                disabled={currentIndex === 0}
                className="w-10 h-10 rounded-full bg-neutral-800 border border-neutral-700 flex items-center justify-center text-gray-400 hover:text-white hover:border-brand-yellow disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={next}
                disabled={currentIndex === maxIndex}
                className="w-10 h-10 rounded-full bg-neutral-800 border border-neutral-700 flex items-center justify-center text-gray-400 hover:text-white hover:border-brand-yellow disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          )}
        </div>

        {/* Mobile: stacked cards */}
        <div className="md:hidden space-y-6">
          {reviews.map((review, i) => (
            <div key={i} className="bg-neutral-900 p-6 rounded-2xl border border-neutral-700 relative">
              <Quote className="absolute top-4 right-4 text-neutral-800" size={36} />
              <div className="flex text-brand-yellow mb-3">
                {[...Array(5)].map((_, j) => <Star key={j} size={14} fill="currentColor" />)}
              </div>
              <p className="text-gray-300 mb-4 relative z-10 text-sm leading-relaxed">"{review.text}"</p>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-white text-sm">{review.author}</p>
                  <p className="text-xs text-gray-500">{review.date}</p>
                </div>
                {review.verified && (
                  <span className="text-xs text-green-500 font-medium bg-green-500/10 px-2 py-1 rounded">Verified</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

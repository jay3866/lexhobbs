import React, { useState, useRef, useEffect } from 'react';
import { X, Upload, Truck, Check, ChevronRight, ChevronLeft, Loader2, Camera, AlertCircle } from 'lucide-react';
import { Button } from './Button';
import { QuoteStep, QuoteFormData } from '../types';
import { analyzeJunkImage, fileToBase64 } from '../services/geminiService';

interface QuoteModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const INITIAL_DATA: QuoteFormData = {
  name: '',
  email: '',
  phone: '',
  address: '',
  junkTypes: [],
  volume: 0.25,
  image: null,
  imagePreviewUrl: null,
  aiAnalysis: ''
};

const JUNK_TYPES = [
  "Furniture", "Appliances", "Yard Waste", "Construction Debris", 
  "Electronics", "General Trash", "Hot Tub", "Mattress"
];

export const QuoteModal: React.FC<QuoteModalProps> = ({ isOpen, onClose }) => {
  const [step, setStep] = useState<QuoteStep>(QuoteStep.JUNK_TYPE);
  const [formData, setFormData] = useState<QuoteFormData>(INITIAL_DATA);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setStep(QuoteStep.JUNK_TYPE);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleNext = () => {
    if (step < QuoteStep.REVIEW) {
      setStep(step + 1);
    } else {
      // Submit logic would go here
      setStep(QuoteStep.SUCCESS);
    }
  };

  const handleBack = () => {
    if (step > 0) setStep(step - 1);
  };

  const toggleJunkType = (type: string) => {
    setFormData(prev => ({
      ...prev,
      junkTypes: prev.junkTypes.includes(type)
        ? prev.junkTypes.filter(t => t !== type)
        : [...prev.junkTypes, type]
    }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setFormData(prev => ({ ...prev, image: file, imagePreviewUrl: url }));
      
      // Trigger AI Analysis
      setIsAnalyzing(true);
      try {
        const base64 = await fileToBase64(file);
        const analysis = await analyzeJunkImage(base64, file.type);
        setFormData(prev => ({ ...prev, aiAnalysis: analysis }));
      } catch (err) {
        console.error(err);
      } finally {
        setIsAnalyzing(false);
      }
    }
  };

  const renderProgressBar = () => {
    const progress = ((step + 1) / 5) * 100;
    return (
      <div className="w-full bg-neutral-800 h-2 mb-6 rounded-full overflow-hidden">
        <div 
          className="h-full bg-brand-yellow transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />
      
      <div className="relative w-full max-w-2xl bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-6 border-b border-neutral-800 flex justify-between items-center bg-neutral-900">
          <div>
            <h2 className="text-2xl font-display font-bold text-white uppercase tracking-wider">
              {step === QuoteStep.SUCCESS ? 'Request Received' : 'Get a Free Estimate'}
            </h2>
            <p className="text-gray-400 text-sm">Moncks Corner, SC • 843-499-0950</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-neutral-800 rounded-full text-gray-400 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {step !== QuoteStep.SUCCESS && renderProgressBar()}

          {step === QuoteStep.JUNK_TYPE && (
            <div className="space-y-6 animate-fadeIn">
              <h3 className="text-xl text-white font-semibold">What do you need removed?</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {JUNK_TYPES.map(type => (
                  <button
                    key={type}
                    onClick={() => toggleJunkType(type)}
                    className={`p-4 rounded-xl border text-left transition-all duration-200 flex flex-col justify-between h-24 ${
                      formData.junkTypes.includes(type)
                        ? 'border-brand-yellow bg-brand-yellow/10 text-brand-yellow shadow-[0_0_15px_rgba(255,215,0,0.1)]'
                        : 'border-neutral-700 bg-neutral-800 text-gray-300 hover:border-neutral-500 hover:bg-neutral-750'
                    }`}
                  >
                    <span className="font-medium">{type}</span>
                    {formData.junkTypes.includes(type) && <Check size={18} />}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === QuoteStep.VOLUME_ESTIMATE && (
            <div className="space-y-8 animate-fadeIn">
              <div>
                <h3 className="text-xl text-white font-semibold mb-2">Estimate Load Size</h3>
                <p className="text-gray-400 text-sm mb-6">Drag the slider or upload a photo for an AI estimate.</p>
                
                {/* Visual Truck Fill */}
                <div className="relative h-48 bg-neutral-800 rounded-xl overflow-hidden border border-neutral-700 mb-6 group">
                  <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none opacity-20">
                    <Truck size={120} />
                  </div>
                  <div 
                    className="absolute bottom-0 left-0 right-0 bg-brand-yellow/80 transition-all duration-300"
                    style={{ height: `${formData.volume * 100}%` }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
                     <span className="text-3xl font-display font-bold text-white drop-shadow-md">
                       {Math.round(formData.volume * 100)}% Full
                     </span>
                  </div>
                </div>

                <input
                  type="range"
                  min="0.1"
                  max="1"
                  step="0.05"
                  value={formData.volume}
                  onChange={(e) => setFormData(prev => ({ ...prev, volume: parseFloat(e.target.value) }))}
                  className="w-full h-2 bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-brand-yellow"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-2 font-mono uppercase">
                   <span>Pickup Bed</span>
                   <span>1/2 Truck</span>
                   <span>Full Truck</span>
                </div>
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-neutral-700"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-neutral-900 text-gray-400">OR UPLOAD A PHOTO</span>
                </div>
              </div>

              <div 
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-neutral-700 rounded-xl p-6 text-center hover:border-brand-yellow hover:bg-neutral-800 transition-colors cursor-pointer"
              >
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept="image/*"
                  onChange={handleImageUpload}
                />
                {formData.imagePreviewUrl ? (
                  <div className="relative">
                    <img src={formData.imagePreviewUrl} alt="Preview" className="max-h-40 mx-auto rounded-lg" />
                    {isAnalyzing && (
                      <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center rounded-lg backdrop-blur-sm">
                        <Loader2 className="animate-spin text-brand-yellow mb-2" size={32} />
                        <span className="text-white font-bold text-sm">AI Analyzing...</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col items-center text-gray-400">
                    <Camera size={32} className="mb-2" />
                    <span className="font-medium">Click to upload junk photo</span>
                    <span className="text-xs mt-1">Our AI will estimate the volume for you</span>
                  </div>
                )}
              </div>

              {formData.aiAnalysis && (
                 <div className="bg-neutral-800/50 border border-brand-yellow/30 p-4 rounded-lg">
                    <div className="flex items-start gap-3">
                       <div className="mt-1 text-brand-yellow"><AlertCircle size={18} /></div>
                       <div>
                          <h4 className="text-sm font-bold text-brand-yellow uppercase mb-1">AI Analysis</h4>
                          <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">{formData.aiAnalysis}</p>
                       </div>
                    </div>
                 </div>
              )}
            </div>
          )}

          {step === QuoteStep.CONTACT_INFO && (
            <div className="space-y-4 animate-fadeIn">
              <h3 className="text-xl text-white font-semibold">Where should we send the estimate?</h3>
              <div className="space-y-4">
                <div>
                   <label className="block text-sm font-medium text-gray-400 mb-1">Full Name</label>
                   <input 
                      type="text" 
                      value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                      className="w-full bg-neutral-800 border border-neutral-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-brand-yellow focus:border-transparent outline-none"
                      placeholder="John Doe"
                   />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Phone</label>
                    <input 
                        type="tel" 
                        value={formData.phone}
                        onChange={e => setFormData({...formData, phone: e.target.value})}
                        className="w-full bg-neutral-800 border border-neutral-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-brand-yellow focus:border-transparent outline-none"
                        placeholder="(843) 499-0950"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Email</label>
                    <input 
                        type="email" 
                        value={formData.email}
                        onChange={e => setFormData({...formData, email: e.target.value})}
                        className="w-full bg-neutral-800 border border-neutral-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-brand-yellow focus:border-transparent outline-none"
                        placeholder="john@example.com"
                    />
                  </div>
                </div>
                <div>
                   <label className="block text-sm font-medium text-gray-400 mb-1">Service Address</label>
                   <input 
                      type="text" 
                      value={formData.address}
                      onChange={e => setFormData({...formData, address: e.target.value})}
                      className="w-full bg-neutral-800 border border-neutral-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-brand-yellow focus:border-transparent outline-none"
                      placeholder="Street Address, Moncks Corner, SC"
                   />
                </div>
              </div>
            </div>
          )}

           {step === QuoteStep.REVIEW && (
            <div className="space-y-6 animate-fadeIn text-white">
              <h3 className="text-xl font-semibold">Review Request</h3>
              
              <div className="bg-neutral-800 rounded-xl p-5 space-y-4 border border-neutral-700">
                <div className="flex justify-between items-start border-b border-neutral-700 pb-4">
                  <div>
                    <span className="text-xs text-gray-500 uppercase tracking-wider">Contact</span>
                    <p className="font-medium">{formData.name}</p>
                    <p className="text-sm text-gray-400">{formData.phone}</p>
                    <p className="text-sm text-gray-400">{formData.address}</p>
                  </div>
                  <button onClick={() => setStep(QuoteStep.CONTACT_INFO)} className="text-xs text-brand-yellow hover:underline">Edit</button>
                </div>
                
                <div className="flex justify-between items-start border-b border-neutral-700 pb-4">
                  <div>
                    <span className="text-xs text-gray-500 uppercase tracking-wider">Items</span>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {formData.junkTypes.map(t => (
                        <span key={t} className="text-xs bg-neutral-900 px-2 py-1 rounded text-gray-300 border border-neutral-700">{t}</span>
                      ))}
                    </div>
                  </div>
                  <button onClick={() => setStep(QuoteStep.JUNK_TYPE)} className="text-xs text-brand-yellow hover:underline">Edit</button>
                </div>

                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-xs text-gray-500 uppercase tracking-wider">Volume Estimate</span>
                    <p className="font-medium">{Math.round(formData.volume * 100)}% Truck Load</p>
                    {formData.imagePreviewUrl && (
                      <img src={formData.imagePreviewUrl} className="w-16 h-16 object-cover rounded mt-2 border border-neutral-600" alt="Junk" />
                    )}
                  </div>
                  <button onClick={() => setStep(QuoteStep.VOLUME_ESTIMATE)} className="text-xs text-brand-yellow hover:underline">Edit</button>
                </div>
              </div>

              <div className="flex items-start gap-3 bg-brand-yellow/10 p-4 rounded-lg border border-brand-yellow/20">
                <Truck className="text-brand-yellow shrink-0" />
                <p className="text-sm text-gray-300">
                  This is a preliminary estimate. Our team will provide a final, guaranteed price upon arrival before any work begins.
                </p>
              </div>
            </div>
          )}

          {step === QuoteStep.SUCCESS && (
            <div className="flex flex-col items-center justify-center text-center py-10 animate-fadeIn">
              <div className="w-20 h-20 bg-brand-yellow rounded-full flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(255,215,0,0.3)]">
                <Check size={40} className="text-neutral-900" />
              </div>
              <h3 className="text-3xl font-display font-bold text-white mb-2">You're All Set!</h3>
              <p className="text-gray-400 max-w-sm mb-8">
                We've received your request. Lex Hobbs or a team member will contact you shortly at <span className="text-white font-medium">{formData.phone}</span> to confirm details.
              </p>
              <Button fullWidth onClick={onClose}>Return to Site</Button>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        {step !== QuoteStep.SUCCESS && (
          <div className="p-6 border-t border-neutral-800 bg-neutral-900 flex justify-between gap-4">
            {step > 0 ? (
              <Button variant="ghost" onClick={handleBack} className="flex items-center gap-2">
                <ChevronLeft size={18} /> Back
              </Button>
            ) : (
              <div></div>
            )}
            <Button 
              onClick={handleNext} 
              disabled={step === QuoteStep.JUNK_TYPE && formData.junkTypes.length === 0}
              className="flex items-center gap-2"
            >
              {step === QuoteStep.REVIEW ? 'Submit Request' : 'Next Step'}
              {step !== QuoteStep.REVIEW && <ChevronRight size={18} />}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
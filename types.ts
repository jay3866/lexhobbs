import React from 'react';

export interface ServiceItem {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}

export enum QuoteStep {
  JUNK_TYPE = 0,
  VOLUME_ESTIMATE = 1,
  CONTACT_INFO = 2,
  REVIEW = 3,
  SUCCESS = 4
}

export interface QuoteFormData {
  name: string;
  email: string;
  phone: string;
  address: string;
  junkTypes: string[];
  volume: number; // 0 to 1 scale (1 = full truck)
  image: File | null;
  imagePreviewUrl: string | null;
  aiAnalysis?: string;
}

// The Worker injects window.__HOBBS__ = { phone, email } from the admin settings.
const SITE_SETTINGS: { phone?: string; email?: string; adsConversion?: string } =
  (typeof window !== 'undefined' && (window as any).__HOBBS__) || {};

export const CONTACT_INFO = {
  phone: SITE_SETTINGS.phone || "843-499-0950",
  email: SITE_SETTINGS.email || "Hobbsjrhauling@gmail.com",
  adsConversion: SITE_SETTINGS.adsConversion || "",
  location: "Moncks Corner, SC",
  facebook: "Hobbs Junk Removal"
};
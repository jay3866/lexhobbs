import React from 'react';

export interface ServiceItem {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}

export enum QuoteStep {
  CONTACT_INFO = 0,
  JUNK_TYPE = 1,
  VOLUME_ESTIMATE = 2,
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

export const CONTACT_INFO = {
  phone: "843-499-0950",
  email: "Hobbsjrhauling@gmail.com",
  location: "Moncks Corner, SC",
  facebook: "Hobbs Junk Removal"
};
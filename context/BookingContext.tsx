'use client'
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface KoreanIdentity {
  koreanName: string;
  hangul: string;
  pronunciation: string;
  meaning: string;
}

export interface BookingData {
  userId: string;
  bookingId: string;
  selectedPass: 'seoul-entry' | 'neon-vibe' | null;
  passPrice: number;
  passName: string;
  userEmail: string;
  userName: string;
  userPhone: string;
  koreanIdentity: KoreanIdentity | null;
  userGender: 'male' | 'female' | 'other';
  userMood: string;
  tontinePaid: number;
  isTontine: boolean;
  amountToPayNow: number;
  remainingAmount: number;
  totalAmount: number;
  isPaid: boolean;
  paymentOperator: 'mtn' | 'celtiis' | null;
  ticketId: string;
  qrCode: string;
}

interface BookingContextType {
  booking: BookingData;
  updateBooking: (data: Partial<BookingData>) => void;
  resetBooking: () => void;
}

const initialBooking: BookingData = {
  userId: '',
  bookingId: '',
  selectedPass: null,
  passPrice: 0,
  passName: '',
  userEmail: '',
  userName: '',
  userPhone: '',
  koreanIdentity: null,
  userGender: 'female',
  userMood: 'dreamy',
  tontinePaid: 0,
  isTontine: false,
  amountToPayNow: 0,
  remainingAmount: 0,
  totalAmount: 0,
  isPaid: false,
  paymentOperator: null,
  ticketId: '',
  qrCode: '',
};

const STORAGE_KEY = 'sah_session';

const BookingContext = createContext<BookingContextType | undefined>(undefined);

export function BookingProvider({ children }: { children: ReactNode }) {
  const [booking, setBooking] = useState<BookingData>(initialBooking);
  const [hydrated, setHydrated] = useState(false);

  // Charger la session depuis localStorage au démarrage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setBooking({ ...initialBooking, ...parsed });
      }
    } catch (e) {
      console.error('Session load error:', e);
    }
    setHydrated(true);
  }, []);

  // Sauvegarder dans localStorage à chaque changement
  useEffect(() => {
    if (!hydrated) return;
    try {
      if (booking.userId) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(booking));
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch (e) {
      console.error('Session save error:', e);
    }
  }, [booking, hydrated]);

  const updateBooking = (data: Partial<BookingData>) => {
    setBooking((prev) => ({ ...prev, ...data }));
  };

  const resetBooking = () => {
    setBooking(initialBooking);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {}
  };

  return (
    <BookingContext.Provider value={{ booking, updateBooking, resetBooking }}>
      {children}
    </BookingContext.Provider>
  );
}

export function useBooking() {
  const context = useContext(BookingContext);
  if (!context) {
    throw new Error('useBooking must be used within BookingProvider');
  }
  return context;
}
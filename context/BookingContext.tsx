'use client'
import { createContext, useContext, useState, ReactNode } from 'react';

export interface KoreanIdentity {
  koreanName: string;
  hangul: string;
  pronunciation: string;
  meaning: string;
}

export interface BookingData {
  // IDs BDD
  userId: string;
  bookingId: string;

  // Pass selection
  selectedPass: 'seoul-entry' | 'neon-vibe' | null;
  passPrice: number;
  passName: string;

  // User account
  userEmail: string;
  userName: string;
  userPhone: string;

  // Korean identity
  koreanIdentity: KoreanIdentity | null;
  userGender: 'male' | 'female' | 'other';
  userMood: string;

  // Tontine
  tontinePaid: number;
  isTontine: boolean;
  amountToPayNow: number;
  remainingAmount: number;

  // Payment
  totalAmount: number;
  isPaid: boolean;
  paymentOperator: 'mtn' | 'celtiis' | null;

  // Ticket
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

const BookingContext = createContext<BookingContextType | undefined>(undefined);

export function BookingProvider({ children }: { children: ReactNode }) {
  const [booking, setBooking] = useState<BookingData>(initialBooking);

  const updateBooking = (data: Partial<BookingData>) => {
    setBooking((prev) => ({ ...prev, ...data }));
  };

  const resetBooking = () => {
    setBooking(initialBooking);
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
'use client'
import { BookingProvider } from '@/context/BookingContext'

export default function FlowLayout({ children }: { children: React.ReactNode }) {
  return (
    <BookingProvider>
      {children}
    </BookingProvider>
  )
}
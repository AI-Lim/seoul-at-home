'use client'
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import { Clock, XCircle, RefreshCw } from 'lucide-react';
import { useBooking } from '../../context/BookingContext';
import { GalaxyBackground } from '../../components/ui/GalaxyBackground';

export default function PaymentWaitingPage() {
  const router = useRouter();
  const { booking, updateBooking } = useBooking();
  const [status, setStatus] = useState<'waiting' | 'rejected'>('waiting');
  const [rejectedNote, setRejectedNote] = useState('');

  useEffect(() => {
    if (!booking.bookingId) {
      router.push('/');
      return;
    }

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/payment/status?bookingId=${booking.bookingId}`);
        const data = await res.json();

        if (data.status === 'PAID') {
          clearInterval(interval);
          updateBooking({ ticketId: data.ticketCode, isPaid: true });
          router.push('/ticket');

        } else if (data.status === 'TONTINE' && !data.hasPendingPayment) {
          clearInterval(interval);
          updateBooking({
            tontinePaid: data.totalPaid,
            remainingAmount: data.remaining,
            amountToPayNow: 0,
            isTontine: true,
          });
          router.push('/tontine');

        } else if (data.lastPaymentStatus === 'FAILED') {
          clearInterval(interval);
          setRejectedNote(data.rejectedNote || '');
          setStatus('rejected');
        }
      } catch (e) {
        console.error('Polling error:', e);
      }
    }, 8000);

    return () => clearInterval(interval);
  }, [booking.bookingId]);

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-[#000007]">
      <GalaxyBackground />

      <div className="relative z-10 px-6 w-full max-w-md text-center py-10 space-y-6">

        {status === 'waiting' && (
          <>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              className="w-24 h-24 mx-auto rounded-full border-4 border-purple-500/20 border-t-purple-500 flex items-center justify-center"
            >
              <Clock className="text-purple-400" size={36} />
            </motion.div>

            <div>
              <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter mb-2">
                En attente
              </h2>
              <p className="text-white/50 text-sm leading-relaxed">
                Ton paiement est en cours de vérification par l'équipe Seoul At Home.
              </p>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-3xl p-5 text-left space-y-3">
              <div className="flex justify-between">
                <span className="text-white/40 text-xs uppercase font-black">Montant</span>
                <span className="text-white font-black">{booking.amountToPayNow || booking.passPrice} F</span>
              </div>
              {booking.isTontine && (
                <div className="flex justify-between">
                  <span className="text-white/40 text-xs uppercase font-black">Type</span>
                  <span className="text-yellow-400 font-black">🪙 Tontine</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-white/40 text-xs uppercase font-black">Pass</span>
                <span className="text-purple-400 font-black text-xs uppercase">{booking.selectedPass?.replace('-', ' ')}</span>
              </div>
            </div>

            <div className="flex items-center justify-center gap-2 text-white/30">
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-2 h-2 rounded-full bg-purple-500"
              />
              <p className="text-xs font-black uppercase tracking-widest">
                Vérification automatique...
              </p>
            </div>
            <p className="text-white/20 text-xs italic">Ne ferme pas cette page.</p>
          </>
        )}

        {status === 'rejected' && (
          <>
            <div className="w-24 h-24 mx-auto rounded-full bg-red-500/20 flex items-center justify-center">
              <XCircle className="text-red-400" size={48} />
            </div>

            <div>
              <h2 className="text-3xl font-black text-red-400 italic uppercase tracking-tighter mb-2">
                Paiement rejeté
              </h2>
              {rejectedNote && (
                <p className="text-white/50 text-sm bg-red-500/10 border border-red-500/20 rounded-2xl px-4 py-3 mt-3">
                  {rejectedNote}
                </p>
              )}
              <p className="text-white/40 text-sm mt-3">
                Tes versements précédents sont conservés. Tu peux réessayer.
              </p>
            </div>

            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => router.push('/payment')}
              className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-500 text-white font-black text-sm uppercase italic rounded-3xl"
            >
              Réessayer le paiement
            </motion.button>
          </>
        )}
      </div>
    </div>
  );
}
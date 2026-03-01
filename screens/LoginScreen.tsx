'use client'
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import { Mail, ArrowRight, ArrowLeft, AlertCircle } from 'lucide-react';
import { useBooking } from '../context/BookingContext';
import { GalaxyBackground } from "../components/ui/GalaxyBackground";

export function LoginScreen() {
  const router = useRouter();
  const { updateBooking, resetBooking } = useBooking();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const isValid = email.length > 0;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const data = await response.json();
      if (!data.success) throw new Error(data.error);

      const booking = data.booking;

      // Mettre à jour le contexte avec toutes les infos
      updateBooking({
        userId: data.user.id,
        userName: data.user.name,
        userEmail: data.user.email,
        userPhone: data.user.phone,
        bookingId: booking?.id || '',
        selectedPass: booking?.selectedPass || null,
        passPrice: booking?.passPrice || 0,
        passName: booking?.selectedPass || '',
        totalAmount: booking?.totalAmount || 0,
        koreanIdentity: booking?.koreanIdentity || null,
        tontinePaid: booking?.tontine?.amountPaid || data.totalPaid || 0,
        remainingAmount: booking?.tontine?.remainingAmount || 0,
        isTontine: booking?.status === 'TONTINE',
        isPaid: booking?.status === 'PAID',
        ticketId: data.ticketCode || booking?.ticket?.ticketCode || '',
        amountToPayNow: 0,
      });

      // Redirection intelligente selon l'état
      switch (data.state) {
        case 'paid':
          router.push('/ticket');
          break;

        case 'tontine_pending':
          // Paiement tontine en attente de validation admin
          router.push('/payment-waiting');
          break;

        case 'tontine_in_progress':
          // Tontine en cours, pas de paiement en attente
          router.push('/tontine');
          break;

        case 'payment_pending':
          // Paiement direct en attente de validation admin
          router.push('/payment-waiting');
          break;

        case 'payment_rejected':
          // Paiement rejeté → retour au paiement avec message
          updateBooking({ isPaid: false });
          setError(`Paiement rejeté${data.rejectedNote ? ` : ${data.rejectedNote}` : ''}. Veuillez réessayer.`);
          break;

        case 'no_booking':
          router.push('/pass-selection');
          break;

        default:
          router.push('/pass-selection');
      }

    } catch (error: any) {
      setError(error.message || 'Utilisateur non trouvé');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col overflow-hidden bg-[#000007]">
      <GalaxyBackground />

      <div className="relative z-10 px-6 py-12 flex flex-col justify-center min-h-screen max-w-md mx-auto w-full">
        
        <motion.button
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => router.back()}
          className="mb-8 flex items-center gap-2 text-white/40 hover:text-white transition-colors w-fit"
        >
          <ArrowLeft size={20} />
          <span className="text-sm uppercase tracking-widest font-medium">Retour</span>
        </motion.button>

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-left mb-10"
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-4 italic">
            Bon Retour !
          </h1>
          <p className="text-white/60 leading-relaxed">
            Connectez-vous pour retrouver votre progression K-Tontine.
          </p>
        </motion.div>

        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          onSubmit={handleLogin}
          className="space-y-6 mb-10"
        >
          <div className="group relative bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[1.5rem] p-4 transition-all duration-300 focus-within:border-blue-500/50 focus-within:bg-white/10">
            <label className="flex items-center gap-2 text-white/40 text-xs font-bold uppercase tracking-tighter mb-1 ml-1 group-focus-within:text-blue-400 transition-colors">
              <Mail size={14} />
              Adresse Email <span className="text-pink-500">*</span>
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seoul@kpop.com"
              className="w-full bg-transparent text-white placeholder:text-white/20 outline-none text-lg font-medium px-1 py-1"
            />
          </div>

          {/* Erreur */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-start gap-3 bg-red-500/10 border border-red-500/20 rounded-2xl px-4 py-3"
            >
              <AlertCircle size={16} className="text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-red-400 text-sm">{error}</p>
            </motion.div>
          )}

          <motion.button
            whileHover={isValid ? { scale: 1.02 } : {}}
            whileTap={isValid ? { scale: 0.98 } : {}}
            type="submit"
            disabled={!isValid || loading}
            className={`group relative w-full py-5 px-8 rounded-[1.5rem] font-black text-lg flex items-center justify-center gap-3 transition-all duration-500 overflow-hidden ${
              isValid && !loading
                ? 'bg-gradient-to-r from-blue-600 via-purple-500 to-pink-500 text-white shadow-[0_20px_40px_rgba(99,102,241,0.3)]'
                : 'bg-white/5 text-white/20 cursor-not-allowed border border-white/5'
            }`}
          >
            {loading ? (
              <span className="relative z-10 uppercase tracking-widest">Connexion...</span>
            ) : (
              <>
                {isValid && (
                  <motion.div 
                    animate={{ x: ['-100%', '100%'] }}
                    transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 pointer-events-none"
                  />
                )}
                <span className="relative z-10 uppercase tracking-widest">Se Connecter</span>
                <ArrowRight className={`relative z-10 transition-transform duration-300 ${isValid ? 'group-hover:translate-x-2' : ''}`} size={22} />
              </>
            )}
          </motion.button>
        </motion.form>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-center"
        >
          <button 
            onClick={() => router.push('/signup')}
            className="text-white/30 text-sm hover:text-white transition-colors underline-offset-4 hover:underline"
          >
            Pas encore de compte ? <span className="text-purple-400 font-bold">Créer mon identité</span>
          </button>
        </motion.div>
      </div>
    </div>
  );
}
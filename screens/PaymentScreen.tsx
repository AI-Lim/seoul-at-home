

'use client'
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Copy, Check, Clock, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import { useBooking } from '../context/BookingContext';
import { GalaxyBackground } from "../components/ui/GalaxyBackground";

export function PaymentScreen() {
  const router = useRouter();
  const { booking, updateBooking } = useBooking();
  const [step, setStep] = useState<'choose' | 'instructions' | 'waiting' | 'rejected'>('choose');
  const [selectedOperator, setSelectedOperator] = useState<'mtn' | 'celtiis' | null>(null);
  const [senderPhone, setSenderPhone] = useState('');
  const [copied, setCopied] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [paymentStatus, setPaymentStatus] = useState<string>('PENDING');
  const [pollCount, setPollCount] = useState(0);

  const amountToPay = booking.amountToPayNow || booking.passPrice || 0;
  const isTontine = booking.isTontine;

  const merchants = {
    mtn: {
      number: process.env.NEXT_PUBLIC_MTN_MERCHANT_NUMBER || '0151250552',
      name: process.env.NEXT_PUBLIC_MTN_MERCHANT_NAME || 'Alonomba Giscard David-Le Roi',
      color: 'from-yellow-500 to-orange-500',
      bg: 'bg-yellow-500/10',
      border: 'border-yellow-500/30',
      label: 'MTN MoMo',
      emoji: '🟡',
    },
    celtiis: {
      number: process.env.NEXT_PUBLIC_CELTIIS_MERCHANT_NUMBER || '0129607449',
      name: process.env.NEXT_PUBLIC_CELTIIS_MERCHANT_NAME || 'Alonomba Giscard David-Le Roi',
      color: 'from-blue-500 to-cyan-500',
      bg: 'bg-blue-500/10',
      border: 'border-blue-500/30',
      label: 'Celtiis Cash',
      emoji: '🔵',
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmitPayment = async () => {
    if (!senderPhone.trim() || !selectedOperator) return;
    setSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/payment/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId: booking.bookingId,
          operator: selectedOperator,
          phone: senderPhone,
          amount: amountToPay,
          isTontine: isTontine,
        })
      });

      const data = await res.json();

      if (data.success) {
        setStep('waiting');
      } else {
        setError(data.error || 'Erreur lors de la soumission');
      }
    } catch (e) {
      setError('Erreur de connexion');
    } finally {
      setSubmitting(false);
    }
  };

  // Polling pour vérifier le statut du paiement
useEffect(() => {
  if (step !== 'waiting') return;

  // Stocker le timestamp du moment où on commence à attendre
  const waitingSince = Date.now();

  const interval = setInterval(async () => {
    try {
      const res = await fetch(`/api/payment/status?bookingId=${booking.bookingId}`);
      const data = await res.json();

      // Ne pas réagir avant 10 secondes minimum
      if (Date.now() - waitingSince < 10000) return;

      if (data.status === 'PAID') {
        clearInterval(interval);
        updateBooking({ ticketId: data.ticketCode });
        router.push('/ticket');

      } else if (data.status === 'TONTINE' && !data.hasPendingPayment) {
        // Tontine validée ET plus de paiement en attente → versement confirmé
        clearInterval(interval);
        updateBooking({
          tontinePaid: data.totalPaid,
          remainingAmount: data.remaining,
          amountToPayNow: 0,
          isTontine: true,
        });
        router.push('/tontine');

      } else if (data.status === 'FAILED') {
        clearInterval(interval);
        setStep('rejected');
      }

    } catch (e) {
      console.error('Polling error:', e);
    }
  }, 10000);

  return () => clearInterval(interval);
}, [step]);

  const operator = selectedOperator ? merchants[selectedOperator] : null;

  return (
    <div className="relative min-h-screen flex flex-col overflow-hidden bg-[#000007]">
      <GalaxyBackground />

      <div className="relative z-10 px-6 py-12 max-w-md mx-auto w-full pb-10">

        <motion.button
          onClick={() => step === 'choose' ? router.back() : setStep('choose')}
          className="mb-8 flex items-center gap-2 text-white/40 hover:text-white transition-colors"
        >
          <ArrowLeft size={20} />
          <span className="text-xs uppercase tracking-widest font-bold">Retour</span>
        </motion.button>

        <AnimatePresence mode="wait">

          {/* ÉTAPE 1 — Choisir opérateur */}
          {step === 'choose' && (
            <motion.div
              key="choose"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="text-center mb-8">
                <h1 className="text-3xl font-black text-white italic uppercase tracking-tighter mb-2">
                  Choisir l'opérateur
                </h1>
                <p className="text-white/40 text-sm">
                  {isTontine ? `Verser ${amountToPay.toLocaleString()} F` : `Payer ${amountToPay.toLocaleString()} F`}
                </p>
                {isTontine && (
                  <div className="mt-3 inline-block bg-yellow-500/10 border border-yellow-500/30 rounded-2xl px-4 py-2">
                    <p className="text-yellow-400 text-xs font-black uppercase">
                      🪙 Versement Tontine
                    </p>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                {(['mtn', 'celtiis'] as const).map((op) => {
                  const m = merchants[op];
                  return (
                    <motion.button
                      key={op}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => { setSelectedOperator(op); setStep('instructions'); }}
                      className={`w-full ${m.bg} border ${m.border} rounded-3xl p-6 flex items-center gap-5 text-left`}
                    >
                      <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${m.color} flex items-center justify-center text-2xl shadow-lg`}>
                        {m.emoji}
                      </div>
                      <div>
                        <p className="text-white font-black text-lg italic uppercase">{m.label}</p>
                        <p className="text-white/40 text-xs mt-1">{m.number}</p>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* ÉTAPE 2 — Instructions de paiement */}
          {step === 'instructions' && operator && (
            <motion.div
              key="instructions"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-5"
            >
              <div className="text-center mb-6">
                <h1 className="text-3xl font-black text-white italic uppercase tracking-tighter mb-1">
                  {operator.label}
                </h1>
                <p className="text-white/40 text-sm">Suivez les étapes ci-dessous</p>
              </div>

              {/* Montant */}
              <div className="bg-white/5 border border-white/10 rounded-3xl p-5 text-center">
                <p className="text-white/40 text-[10px] font-black uppercase tracking-widest mb-1">Montant à envoyer</p>
                <p className="text-4xl font-black text-white italic">{amountToPay.toLocaleString()} F</p>
                {isTontine && (
                  <p className="text-yellow-400 text-xs mt-2 font-bold">Versement tontine</p>
                )}
              </div>

              {/* Numéro à copier */}
              <div className={`${operator.bg} border ${operator.border} rounded-3xl p-5`}>
                <p className="text-white/40 text-[10px] font-black uppercase tracking-widest mb-3">
                  Envoyer au numéro
                </p>
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-white font-black text-2xl italic tracking-tighter">{operator.number}</p>
                    <p className="text-white/50 text-xs mt-1">{operator.name}</p>
                  </div>
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => copyToClipboard(operator.number)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-2xl font-black text-xs uppercase transition-all ${
                      copied ? 'bg-green-500 text-white' : 'bg-white text-black'
                    }`}
                  >
                    {copied ? <Check size={14} /> : <Copy size={14} />}
                    {copied ? 'Copié !' : 'Copier'}
                  </motion.button>
                </div>
              </div>

              {/* Instructions étapes */}
              <div className="bg-white/5 border border-white/10 rounded-3xl p-5 space-y-3">
                <p className="text-white/40 text-[10px] font-black uppercase tracking-widest mb-4">Comment faire</p>
                {[
                  `Ouvre ton appli ${operator.label}`,
                  `Envoie exactement ${amountToPay.toLocaleString()} F`,
                  `Au numéro ${operator.number}`,
                  'Reviens ici et entre ton numéro d\'envoi',
                ].map((step, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className={`w-6 h-6 rounded-full bg-gradient-to-br ${operator.color} flex items-center justify-center flex-shrink-0 text-white font-black text-xs`}>
                      {i + 1}
                    </div>
                    <p className="text-white/70 text-sm">{step}</p>
                  </div>
                ))}
              </div>

              {/* Input numéro d'envoi */}
              <div className="bg-white/5 border border-white/10 rounded-3xl p-5 focus-within:border-white/30 transition-colors">
                <p className="text-white/40 text-[10px] font-black uppercase tracking-widest mb-3">
                  Ton numéro qui a envoyé
                </p>
                <input
                  type="tel"
                  value={senderPhone}
                  onChange={(e) => setSenderPhone(e.target.value)}
                  placeholder="ex: 97000000"
                  className="w-full bg-transparent text-white font-black text-xl outline-none placeholder:text-white/10"
                />
              </div>

              {error && (
                <p className="text-red-400 text-xs font-bold text-center">{error}</p>
              )}

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSubmitPayment}
                disabled={!senderPhone.trim() || submitting}
                className={`w-full py-5 rounded-3xl font-black text-sm uppercase italic tracking-widest flex items-center justify-center gap-3 transition-all ${
                  senderPhone.trim() && !submitting
                    ? `bg-gradient-to-r ${operator.color} text-white shadow-2xl`
                    : 'bg-white/5 text-white/20'
                }`}
              >
                {submitting ? (
                  <><RefreshCw className="animate-spin" size={18} /> Envoi...</>
                ) : (
                  "J'ai effectué le dépôt ✓"
                )}
              </motion.button>
            </motion.div>
          )}

          {/* ÉTAPE 3 — En attente de validation */}
          {step === 'waiting' && (
            <motion.div
              key="waiting"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-10 space-y-6"
            >
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
                  <span className="text-white font-black">{amountToPay.toLocaleString()} F</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/40 text-xs uppercase font-black">Opérateur</span>
                  <span className="text-white font-black uppercase">{selectedOperator}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/40 text-xs uppercase font-black">Numéro envoi</span>
                  <span className="text-white font-black">{senderPhone}</span>
                </div>
                {isTontine && (
                  <div className="flex justify-between">
                    <span className="text-white/40 text-xs uppercase font-black">Type</span>
                    <span className="text-yellow-400 font-black">🪙 Tontine</span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-center gap-2 text-white/30">
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="w-2 h-2 rounded-full bg-purple-500"
                />
                <p className="text-xs font-black uppercase tracking-widest">
                  Vérification automatique en cours...
                </p>
              </div>

              <p className="text-white/20 text-xs italic">
                Cette page se met à jour automatiquement. Ne la ferme pas.
              </p>
            </motion.div>
          )}

          {/* ÉTAPE 4 — Paiement rejeté */}
          {step === 'rejected' && (
            <motion.div
              key="rejected"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-10 space-y-6"
            >
              <div className="w-24 h-24 mx-auto rounded-full bg-red-500/20 flex items-center justify-center">
                <XCircle className="text-red-400" size={48} />
              </div>

              <div>
                <h2 className="text-3xl font-black text-red-400 italic uppercase tracking-tighter mb-2">
                  Paiement rejeté
                </h2>
                <p className="text-white/50 text-sm">
                  Ton paiement n'a pas pu être vérifié. Contacte-nous ou réessaie.
                </p>
              </div>

              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => setStep('choose')}
                className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-500 text-white font-black text-sm uppercase italic rounded-3xl"
              >
                Réessayer
              </motion.button>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}
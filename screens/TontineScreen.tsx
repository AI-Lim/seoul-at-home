'use client'
import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { Info, ArrowLeft, Coins, ArrowRight } from 'lucide-react';
import { useBooking } from '../context/BookingContext';
import { GalaxyBackground } from "../components/ui/GalaxyBackground";

const tamponImg = "/tampon.png";

export function TontineScreen() {
  const router = useRouter();
  const { booking, updateBooking } = useBooking();
  
  const BOX_VALUE = 1000;
  const TOTAL_BOXES = 10;
  const passPrice = Number(booking.passPrice) || 0;
  const maxBoxes = Math.floor(passPrice / BOX_VALUE);

  // Boxes déjà payées (depuis la BDD via login)
  const alreadyPaidBoxes = Math.floor((booking.tontinePaid || 0) / BOX_VALUE);
  
  // Boxes cochées = déjà payées + nouvelles sélections
  const [selectedBoxes, setSelectedBoxes] = useState<number[]>(() => {
    // Initialiser avec les boxes déjà payées
    return Array.from({ length: alreadyPaidBoxes }, (_, i) => i + 1);
  });

  // Recharger si booking change (après login)
 useEffect(() => {
  const paid = Math.floor((booking.tontinePaid || 0) / BOX_VALUE);
  if (paid > 0) {
    setSelectedBoxes(Array.from({ length: paid }, (_, i) => i + 1));
  }
}, [booking.tontinePaid]);

  const toggleBox = (boxId: number) => {
    // Ne pas décocher les boxes déjà payées
    if (boxId <= alreadyPaidBoxes) return;
    
    setSelectedBoxes(prev => {
      if (prev.includes(boxId)) {
        return prev.filter(id => id !== boxId);
      } else {
        if (prev.length < maxBoxes) {
          return [...prev, boxId];
        }
        return prev;
      }
    });
  };

  const tontineAmount = selectedBoxes.length * BOX_VALUE;
  // Montant à payer = seulement les NOUVELLES boxes (pas celles déjà payées)
  const newBoxesAmount = (selectedBoxes.length - alreadyPaidBoxes) * BOX_VALUE;
  const amountToPayNow = newBoxesAmount > 0 ? newBoxesAmount : 0;
  const remainingAmount = passPrice - tontineAmount;
  const isComplete = selectedBoxes.length >= maxBoxes;

  const handleContinue = async () => {
    if (amountToPayNow === 0 && !isComplete) return;

    try {
      if (booking.bookingId) {
        await fetch('/api/booking', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            bookingId: booking.bookingId,
            status: isComplete ? 'PAID' : 'TONTINE',
          })
        });
      }

      updateBooking({
        tontinePaid: tontineAmount,
        amountToPayNow: amountToPayNow,
        isTontine: !isComplete,
        remainingAmount: remainingAmount,
      });

      router.push('/payment');
    } catch (error) {
      console.error('Tontine error:', error);
      router.push('/payment');
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col overflow-hidden bg-[#000007]">
      <GalaxyBackground />

      <div className="relative z-10 px-6 py-12 max-w-md mx-auto w-full pb-6">
        <motion.button
          onClick={() => router.back()}
          className="mb-6 flex items-center gap-2 text-white/40 hover:text-white transition-colors"
        >
          <ArrowLeft size={20} />
          <span className="text-xs uppercase tracking-widest font-bold">Retour</span>
        </motion.button>

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="inline-block p-3 rounded-2xl bg-white/5 border border-white/10 mb-4">
            <Coins className="text-yellow-400" size={32} />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent mb-4 italic uppercase">
            K-VIBE TONTINE
          </h1>
          <p className="text-white/50 text-sm mt-2">Cotisez à votre rythme pour votre Pass</p>
        </motion.div>

        {/* Info Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative rounded-3xl p-[1px] overflow-hidden bg-gradient-to-br from-blue-400/40 to-purple-400/40 mb-8"
        >
          <div className="bg-[#0c0c1e]/80 backdrop-blur-2xl p-5 rounded-[1.8rem] flex gap-4">
            <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
              <Info className="text-blue-300" size={20} />
            </div>
            <div className="text-white/70 text-xs leading-relaxed">
              Utilisez la tontine pour réserver votre place avec un acompte.
              <span className="text-blue-300 font-bold block mt-1 uppercase tracking-wider">1 box = 1 000 F d'acompte.</span>
              {alreadyPaidBoxes > 0 && (
                <span className="text-yellow-400 font-bold block mt-1">
                  ✓ {alreadyPaidBoxes} box{alreadyPaidBoxes > 1 ? 'es' : ''} déjà payée{alreadyPaidBoxes > 1 ? 's' : ''} — cases verrouillées.
                </span>
              )}
            </div>
          </div>
        </motion.div>

        {/* Tontine Grid */}
        <div className="mb-10">
          <div className="flex justify-between items-end mb-4 px-2">
            <label className="text-white text-[10px] font-black uppercase tracking-[0.2em]">
              Votre Avancement
            </label>
            <span className="text-white/40 text-[10px] font-bold">
              {selectedBoxes.length} / {maxBoxes} BOXES
            </span>
          </div>
          
          <div className="grid grid-cols-5 gap-3">
            {Array.from({ length: TOTAL_BOXES }, (_, i) => i + 1).map((boxId) => {
              const isSelected = selectedBoxes.includes(boxId);
              const isPaid = boxId <= alreadyPaidBoxes;
              const isDisabled = boxId > maxBoxes;
              
              return (
                <motion.button
                  key={boxId}
                  whileHover={!isDisabled && !isPaid ? { scale: 1.05 } : {}}
                  whileTap={!isDisabled && !isPaid ? { scale: 0.95 } : {}}
                  onClick={() => !isDisabled && toggleBox(boxId)}
                  disabled={isDisabled}
                  className={`aspect-square rounded-2xl transition-all relative overflow-hidden flex items-center justify-center border-2 ${
                    isSelected && isPaid
                      ? 'bg-black border-yellow-400/50 shadow-[0_0_15px_rgba(234,179,8,0.2)]'
                      : isSelected
                      ? 'bg-black border-white shadow-[0_0_20px_rgba(255,255,255,0.2)]'
                      : isDisabled 
                      ? 'bg-black/40 border-white/5 opacity-20'
                      : 'bg-white/5 border-white/10 hover:border-white/30'
                  }`}
                >
                  <AnimatePresence>
                    {isSelected ? (
                      <motion.div
                        key="tampon"
                        initial={{ scale: 2, opacity: 0, rotate: -20 }}
                        animate={{ scale: 1, opacity: 1, rotate: (boxId % 2 === 0 ? 10 : -10) }}
                        exit={{ scale: 0, opacity: 0 }}
                        className="w-full h-full p-1"
                      >
                        <img 
                          src={tamponImg} 
                          alt="Tamponné" 
                          className={`w-full h-full object-contain ${isPaid ? 'opacity-60' : ''}`}
                        />
                        {/* Cadenas sur les boxes déjà payées */}
                        {isPaid && (
                          <div className="absolute inset-0 flex items-end justify-end p-1">
                            <span className="text-[8px]">🔒</span>
                          </div>
                        )}
                      </motion.div>
                    ) : (
                      <motion.span
                        key="number"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="text-xs font-black text-white/20"
                      >
                        {boxId}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Recap Card */}
        <div className="rounded-[2.5rem] border border-white/10 bg-white/5 backdrop-blur-3xl p-6 relative overflow-hidden">
          <div className="space-y-4 relative z-10">

            <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-white/50">
              <span>Prix du Pass {booking.passName || booking.selectedPass}</span>
              <span className="text-white">{passPrice.toLocaleString()} F</span>
            </div>

            {alreadyPaidBoxes > 0 && (
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black uppercase tracking-widest text-yellow-400">Déjà payé</span>
                <span className="text-lg font-black text-yellow-400 italic">
                  - {(alreadyPaidBoxes * BOX_VALUE).toLocaleString()} F
                </span>
              </div>
            )}
            
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-black uppercase tracking-widest text-purple-400">Acompte ce jour</span>
              <motion.span 
                key={amountToPayNow}
                initial={{ scale: 1.3, color: "#a855f7" }}
                animate={{ scale: 1, color: "#ffffff" }}
                transition={{ duration: 0.2 }}
                className="text-xl font-black italic tracking-tighter"
              >
                {amountToPayNow.toLocaleString()} F
              </motion.span>
            </div>

            <div className="h-[1px] bg-white/10 w-full" />

            <div className="flex justify-between items-center">
              <div>
                <p className="text-[9px] font-black text-white/40 uppercase tracking-tighter mb-1">Reste à payer</p>
                <motion.p
                  key={remainingAmount}
                  initial={{ y: -5, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.2 }}
                  className="text-xl font-black text-white tracking-tighter tabular-nums"
                >
                  {remainingAmount.toLocaleString()} F
                </motion.p>
              </div>
              <div className="text-right">
                <p className="text-[9px] font-black text-cyan-400 uppercase tracking-tighter mb-1">À payer ce jour</p>
                <motion.p
                  key={amountToPayNow}
                  initial={{ y: -5, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.2 }}
                  className="text-2xl font-black text-cyan-400 tracking-tighter italic tabular-nums"
                >
                  {amountToPayNow.toLocaleString()} F
                </motion.p>
              </div>
            </div>

            {isComplete && (
              <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-2xl p-3 text-center">
                <p className="text-cyan-400 font-black text-xs uppercase tracking-widest">
                  🎉 Tontine complète ! Ton Soul Pass sera généré après paiement.
                </p>
              </div>
            )}

          </div>
          <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-purple-500/20 blur-[50px] rounded-full" />
        </div>

      </div>

      {/* Footer Button */}
     {/* Footer Buttons */}
{/* Buttons */}
<div className="top-100 space-y-3  ">
  
  <motion.button
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    onClick={() => {
      updateBooking({
        isTontine: false,
        amountToPayNow: passPrice,
        tontinePaid: 0,
        remainingAmount: 0,
      });
      router.push('/payment');
    }}
    className="relative w-full py-4 rounded-[1.8rem] font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3 overflow-hidden bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 text-white shadow-2xl"
  >
    <motion.div 
      animate={{ x: ['-100%', '100%'] }}
      transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12"
    />
    <span className="relative z-10 italic font-black">
      💳 Payer {passPrice.toLocaleString()} F maintenant
    </span>
  </motion.button>

  <motion.button
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    onClick={handleContinue}
    disabled={amountToPayNow === 0 && !isComplete}
    className={`relative w-full py-4 rounded-[1.8rem] font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3 overflow-hidden transition-all ${
      amountToPayNow > 0 || isComplete
        ? 'bg-gradient-to-r from-yellow-500 via-orange-500 to-pink-500 text-white shadow-2xl'
        : 'bg-white/5 text-white/20 border border-white/5'
    }`}
  >
    <motion.div 
      animate={{ x: ['-100%', '100%'] }}
      transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
      className="absolute inset-0  bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12"
    />
    <span className="relative z-10 italic font-black">
      {isComplete 
        ? "✅ Finaliser la tontine !" 
        : amountToPayNow > 0 
          ? `🪙 Tontine — Payer ${amountToPayNow.toLocaleString()} F`
          : "Sélectionne des boxes pour la tontine"
      }
    </span>
    <ArrowRight className="relative z-10" size={18} />
  </motion.button>

  <button 
    onClick={() => setSelectedBoxes(Array.from({ length: alreadyPaidBoxes }, (_, i) => i + 1))}
    className="w-full text-[9px] font-black text-white/20 uppercase tracking-[0.3em] hover:text-white transition-colors text-center italic pt-2"
  >
    Réinitialiser les sélections
  </button>
</div>
    </div>
  );
}
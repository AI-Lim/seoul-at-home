'use client'
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import { Check, Sparkles, Star, Zap, ArrowLeft, Flame } from 'lucide-react';
import { useBooking } from '../context/BookingContext';
import { GalaxyBackground } from "../components/ui/GalaxyBackground";

const passes = [
  {
    id: 'seoul-entry',
    name: 'Seoul Entry Pass',
    price: 7000,
    icon: Sparkles,
    color: 'from-purple-500 to-blue-500',
    features: [
      'Accès à l\'événement',
      'Identité coréenne générée',
      'Goodies ',
    ],
  },
  {
    id: 'neon-vibe',
    name: 'Neon Vibe Pass',
    price: 10000,
    icon: Zap,
    color: 'from-pink-500 to-purple-600',
    popular: true,
    features: [
      'Tout du Seoul Entry Pass',
      'Accès VIP zone',
      'Priorité file d\'attente',
    ],
  },
];

export function PassSelectionScreen() {
  const router = useRouter();
  const { booking, updateBooking } = useBooking();
  const [selectedPass, setSelectedPass] = useState(booking.selectedPass);
  const [availability, setAvailability] = useState<{
    seoulEntry: { total: number, sold: number, remaining: number },
    neonVibe: { total: number, sold: number, remaining: number }
  } | null>(null);

  useEffect(() => {
    fetch('/api/admin/config')
      .then(res => res.json())
      .then(data => {
        if (data.success) setAvailability(data.availability)
      })
      .catch(console.error)
  }, []);

  const getAvailability = (passId: string) => {
    if (!availability) return null;
    return passId === 'seoul-entry' ? availability.seoulEntry : availability.neonVibe;
  };

  const getUrgencyColor = (remaining: number, total: number) => {
    const percent = remaining / total;
    if (percent <= 0.1) return 'text-red-400';
    if (percent <= 0.3) return 'text-orange-400';
    return 'text-green-400';
  };

  const getUrgencyText = (remaining: number, total: number) => {
    const percent = remaining / total;
    if (remaining <= 0) return '❌ Épuisé';
    if (percent <= 0.1) return `🔥 Plus que ${remaining} places !`;
    if (percent <= 0.3) return `⚡ ${remaining} places restantes`;
    return `✓ ${remaining} places disponibles`;
  };

  const handleContinue = () => {
    if (!selectedPass) return;
    const pass = passes.find(p => p.id === selectedPass);
    if (pass) {
      updateBooking({
        selectedPass,
        passPrice: pass.price,
        totalAmount: pass.price,
        passName: pass.name,
      });
      router.push('/signup');
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col overflow-hidden bg-[#000007]">
      <GalaxyBackground />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-64 bg-purple-600/10 blur-[120px] pointer-events-none" />

      <div className="relative z-10 px-6 py-12 max-w-md mx-auto w-full">
        
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={() => router.back()}
          className="mb-6 flex items-center gap-2 text-white/50 hover:text-white transition-colors"
        >
          <ArrowLeft size={20} />
          <span>Retour</span>
        </motion.button>

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent mb-4 italic">
            Choisissez Votre Pass
          </h1>
          <p className="text-white/60">Sélectionnez l'expérience qui vous correspond</p>
        </motion.div>

        <div className="space-y-6 mb-10">
          {passes.map((pass, index) => {
            const Icon = pass.icon;
            const isSelected = selectedPass === pass.id;
            const avail = getAvailability(pass.id);

            return (
              <motion.div
                key={pass.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => avail?.remaining !== 0 && setSelectedPass(pass.id as any)}
                  className={`relative cursor-pointer rounded-[2rem] p-6 transition-all duration-500 ${
                    avail?.remaining === 0 ? 'opacity-50 cursor-not-allowed' :
                    isSelected
                      ? 'bg-white/10 backdrop-blur-3xl border border-white/30 shadow-[0_0_40px_rgba(168,85,247,0.25)]'
                      : 'bg-white/5 backdrop-blur-xl border border-white/10'
                  }`}
                >
                  {/* Popular Badge */}
                  {pass.popular && (
                    <div className="absolute -top-3 right-8">
                      <div className="bg-gradient-to-r from-pink-500 to-purple-600 text-white text-[10px] font-black tracking-widest px-3 py-1 rounded-full flex items-center gap-1 shadow-lg">
                        <Star size={10} fill="currentColor" />
                        POPULAIRE
                      </div>
                    </div>
                  )}

                  {/* Icon & Title */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${pass.color} flex items-center justify-center shadow-2xl relative`}>
                        <div className="absolute inset-0 rounded-2xl blur-lg bg-inherit opacity-50" />
                        <Icon className="text-white relative z-10" size={28} />
                      </div>
                      <div>
                        <h3 className="text-white font-bold text-xl">{pass.name}</h3>
                        <div className="text-2xl font-black text-white mt-1">
                          {pass.price.toLocaleString()} <span className="text-sm font-medium opacity-60">F</span>
                        </div>
                      </div>
                    </div>

                    <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                      isSelected ? 'border-white bg-white' : 'border-white/20 bg-transparent'
                    }`}>
                      {isSelected && <Check className="text-black" size={16} strokeWidth={4} />}
                    </div>
                  </div>

                  {/* Urgency Badge */}
                  {avail && (
                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex items-center gap-2 mb-4 px-3 py-2 rounded-xl bg-white/5 border border-white/10 w-fit ${getUrgencyColor(avail.remaining, avail.total)}`}
                    >
                      <Flame size={12} />
                      <span className="text-[11px] font-black uppercase tracking-wider">
                        {getUrgencyText(avail.remaining, avail.total)}
                      </span>
                    </motion.div>
                  )}

                  {/* Progress bar */}
                  {avail && (
                    <div className="mb-4">
                      <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${(avail.sold / avail.total) * 100}%` }}
                          transition={{ duration: 1, ease: "easeOut" }}
                          className={`h-full rounded-full ${
                            avail.remaining / avail.total <= 0.1
                              ? 'bg-red-400'
                              : avail.remaining / avail.total <= 0.3
                              ? 'bg-orange-400'
                              : 'bg-green-400'
                          }`}
                        />
                      </div>
                    </div>
                  )}

                  {/* Features */}
                  <div className="space-y-2">
                    {pass.features.map((feature, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <div className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-pink-400' : 'bg-white/20'}`} />
                        <span className={`text-sm transition-colors ${isSelected ? 'text-white' : 'text-white/50'}`}>
                          {feature}
                        </span>
                      </div>
                    ))}
                  </div>

                  {isSelected && (
                    <motion.div
                      layoutId="liquidGlow"
                      className="absolute inset-0 rounded-[2rem] bg-gradient-to-br from-purple-500/10 via-transparent to-blue-500/10 -z-10 blur-xl"
                    />
                  )}
                </motion.div>
              </motion.div>
            );
          })}
        </div>

        {/* Continue Button */}
        <div className="fixed bottom-8 left-0 right-0 px-6 max-w-md mx-auto">
          <motion.button
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            whileHover={selectedPass ? { scale: 1.02 } : {}}
            whileTap={selectedPass ? { scale: 0.98 } : {}}
            onClick={handleContinue}
            disabled={!selectedPass}
            className={`w-full py-4 rounded-2xl font-bold text-lg transition-all duration-500 flex items-center justify-center gap-2 ${
              selectedPass
                ? 'bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 text-white shadow-xl'
                : 'bg-white/5 text-white/20 cursor-not-allowed border border-white/5'
            }`}
          >
            <span>Continuer l'aventure</span>
            <Sparkles size={18} />
          </motion.button>
        </div>
      </div>
    </div>
  );
}
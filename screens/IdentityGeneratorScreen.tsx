'use client'
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, RefreshCw, Heart, Zap, Cloud, Moon, 
  User, UserCircle, Ghost, ArrowRight, ArrowLeft, Wand2,
  Flame, Flower2, Stars
} from 'lucide-react';
import { useBooking } from '../context/BookingContext';
import { generateKoreanName } from '../utils/koreanNames';
import { GalaxyBackground } from "../components/ui/GalaxyBackground";

const genders = [
  { id: 'female', label: 'Féminin', icon: UserCircle, color: 'from-pink-500/20' },
  { id: 'male', label: 'Masculin', icon: User, color: 'from-blue-500/20' },
  { id: 'other', label: 'Autre', icon: Ghost, color: 'from-purple-500/20' },
];

const moods = [
  { id: 'dreamy', label: 'Dreamy', icon: Cloud, color: 'from-cyan-400 to-blue-400' },
  { id: 'energetic', label: 'Énergique', icon: Zap, color: 'from-orange-400 to-yellow-400' },
  { id: 'elegant', label: 'Élégant', icon: Heart, color: 'from-rose-400 to-pink-400' },
  { id: 'mysterious', label: 'Mystérieux', icon: Moon, color: 'from-indigo-600 to-purple-600' },
  { id: 'fierce', label: 'Fierce', icon: Flame, color: 'from-red-500 to-orange-500' },
  { id: 'soft', label: 'Soft', icon: Flower2, color: 'from-pink-300 to-rose-300' },
  { id: 'cosmic', label: 'Cosmique', icon: Stars, color: 'from-violet-600 to-blue-600' },
  { id: 'pure', label: 'Pure', icon: Sparkles, color: 'from-white/40 to-slate-300' },
];

export function IdentityGeneratorScreen() {
  const router = useRouter();
  const { booking, updateBooking } = useBooking();
  const [selectedGender, setSelectedGender] = useState(booking.userGender || 'female');
  const [selectedMood, setSelectedMood] = useState(booking.userMood || 'dreamy');
  const [identity, setIdentity] = useState(booking.koreanIdentity);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');

  // ✅ Async pour attendre la réponse de l'API
const handleGenerate = async () => {
  setIsGenerating(true);
  setError('');
  try {
    const response = await fetch('/api/identity/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        gender: selectedGender,
        mood: selectedMood,
        bookingId: booking.bookingId || null
      })
    });

    const data = await response.json();
    
    if (!data.success) throw new Error(data.error);
    
    const newIdentity = data.identity;
    setIdentity(newIdentity);
    updateBooking({
      koreanIdentity: newIdentity,
      userGender: selectedGender,
      userMood: selectedMood,
    });
  } catch (e) {
    setError('Erreur de génération, réessayez.');
  } finally {
    setIsGenerating(false);
  }
};

  const handleContinue = () => {
    if (identity) router.push('/tontine');
  };

  return (
    <div className="relative min-h-screen flex flex-col overflow-hidden bg-[#000007]">
      <GalaxyBackground />

      <div className="relative z-10 px-6 py-12 max-w-md mx-auto w-full pb-40">
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={() => router.back()}
          className="mb-6 flex items-center gap-2 text-white/40 hover:text-white transition-colors"
        >
          <ArrowLeft size={20} />
          <span className="text-xs uppercase tracking-widest font-bold">Retour</span>
        </motion.button>

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <div className="relative w-20 h-20 mx-auto mb-4">
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 rounded-full bg-gradient-to-tr from-purple-500 via-pink-500 to-blue-500 blur-md opacity-50"
            />
            <div className="relative w-full h-full rounded-full bg-black/40 backdrop-blur-xl border border-white/20 flex items-center justify-center shadow-inner">
              <Wand2 className="text-white" size={32} />
            </div>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent mb-2 italic tracking-tight">
            K-VIBE IDENTITY
          </h1>
          <p className="text-white/50 text-sm">Créez l'avatar qui vous représentera</p>
        </motion.div>

        <div className="space-y-8 mb-10">
          <section>
            <h2 className="text-white/40 text-[10px] font-black uppercase tracking-[0.2em] mb-4 ml-1">Genre</h2>
            <div className="grid grid-cols-3 gap-3">
              {genders.map((g) => {
                const Icon = g.icon;
                const active = selectedGender === g.id;
                return (
                  <button
                    key={g.id}
                    onClick={() => setSelectedGender(g.id)}
                    className={`relative p-4 rounded-2xl flex flex-col items-center gap-2 transition-all duration-300 border ${
                      active ? 'bg-white/15 border-white/40 shadow-lg shadow-purple-500/20' : 'bg-white/5 border-white/5 opacity-60'
                    }`}
                  >
                    <Icon size={24} className={active ? 'text-purple-400' : 'text-white'} />
                    <span className="text-[11px] font-bold text-white uppercase">{g.label}</span>
                  </button>
                );
              })}
            </div>
          </section>

          <section>
            <h2 className="text-white/40 text-[10px] font-black uppercase tracking-[0.2em] mb-4 ml-1">Vibe</h2>
           <div className="grid grid-cols-2 gap-3 max-h-80 ">
              {moods.map((m) => {
                const Icon = m.icon;
                const active = selectedMood === m.id;
                return (
                  <button
                    key={m.id}
                    onClick={() => setSelectedMood(m.id)}
                    className={`relative p-4 rounded-[1.5rem] flex items-center gap-4 transition-all duration-300 border ${
                      active ? 'bg-white/10 border-white/40' : 'bg-white/5 border-white/5 opacity-50'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${m.color} flex items-center justify-center shadow-lg`}>
                      <Icon size={20} className="text-white" />
                    </div>
                    <span className="text-sm font-bold text-white uppercase tracking-tighter">{m.label}</span>
                    {active && <motion.div layoutId="mood-check" className="absolute right-3 w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_8px_white]" />}
                  </button>
                );
              })}
            </div>
          </section>
        </div>

        {/* ✅ Message d'erreur si l'API échoue */}
        {error && (
          <p className="text-red-400 text-xs text-center mb-4 font-bold">{error}</p>
        )}

        <motion.button
          whileHover={{ scale: 1.02, boxShadow: "0px 0px 30px rgba(168,85,247,0.4)" }}
          whileTap={{ scale: 0.98 }}
          onClick={handleGenerate}
          disabled={isGenerating}
          className="relative w-full py-5 rounded-[1.5rem] font-black text-lg flex items-center justify-center gap-3 overflow-hidden transition-all duration-500 bg-gradient-to-r from-purple-600 via-pink-500 to-blue-500 text-white shadow-[0_15px_35px_rgba(168,85,247,0.3)]"
        >
          <motion.div 
            animate={{ x: ['-100%', '100%'] }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent -skew-x-12"
          />
          <span className="relative z-10 flex items-center gap-3 uppercase tracking-wider">
            {isGenerating ? (
              <>
                <RefreshCw className="animate-spin" size={22} />
                <span>L'IA crée votre identité...</span>
              </>
            ) : (
              <>
                <Sparkles size={20} />
                <span>{identity ? 'Régénérer mon identité' : 'Générer mon nom coréen'}</span>
              </>
            )}
          </span>
        </motion.button>

        <AnimatePresence mode="wait">
          {identity && !isGenerating && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, rotateY: -15 }}
              animate={{ opacity: 1, scale: 1, rotateY: 0 }}
              exit={{ opacity: 0, scale: 0.9, rotateY: 15 }}
              transition={{ type: "spring", damping: 20 }}
              className="mt-12 relative"
              style={{ perspective: "1000px" }}
            >
              <div className="relative group rounded-[3rem] p-[2px] overflow-hidden bg-gradient-to-br from-purple-400 via-pink-400 to-cyan-400 shadow-[0_0_50px_rgba(168,85,247,0.3)]">
                <div className="relative rounded-[2.9rem] bg-[#0c0c1e]/80 backdrop-blur-3xl p-8 text-center overflow-hidden">
                  
                  <motion.div animate={{ y: [0, -8, 0], rotate: [0, 10, 0] }} transition={{ duration: 4, repeat: Infinity }} className="absolute top-6 left-8 text-pink-400/30">
                    <Heart size={24} fill="currentColor" />
                  </motion.div>
                  <motion.div animate={{ y: [0, 8, 0], rotate: [0, -10, 0] }} transition={{ duration: 5, repeat: Infinity, delay: 1 }} className="absolute bottom-10 right-8 text-cyan-400/30">
                    <Sparkles size={28} />
                  </motion.div>
                  <div className="absolute top-1/2 left-4 text-purple-400/10 text-4xl">🌸</div>
                  <div className="absolute top-1/4 right-6 text-yellow-400/10 text-2xl">✨</div>

                  <motion.div 
                    animate={{ left: ['-150%', '150%'], top: ['-150%', '150%'] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute w-[200%] h-[200%] bg-gradient-to-br from-transparent via-white/10 to-transparent rotate-45 pointer-events-none"
                  />

                  <div className="relative z-10">
                    <span className="text-[10px] font-black tracking-[0.4em] bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent uppercase mb-6 block">Soul Pass Digital</span>
                    
                    <div className="relative inline-block mb-4">
                      <div className="absolute inset-0 blur-2xl bg-purple-500/40 rounded-full" />
                      <div className="text-7xl font-bold text-white relative drop-shadow-[0_0_15px_rgba(255,255,255,0.4)]">
                        {identity.hangul}
                      </div>
                    </div>
                    
                    <div className="text-3xl font-black text-white mb-1 uppercase tracking-tighter italic">
                      {identity.koreanName}
                    </div>
                    
                    <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-white/5 border border-white/10 mb-6">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_cyan]" />
                      <p className="text-cyan-200/70 text-sm font-medium italic">
                        "{identity.pronunciation}"
                      </p>
                    </div>

                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-3xl blur-sm" />
                      <div className="relative bg-black/40 rounded-[1.8rem] p-5 border border-white/10 backdrop-blur-md">
                        <p className="text-white/90 text-sm leading-relaxed font-medium">
                          {identity.meaning}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {identity && !isGenerating && (
          <div className="fixed bottom-8 left-0 right-0 px-6 z-50 max-w-md mx-auto">
            <motion.button
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              whileHover={{ scale: 1.02, boxShadow: "0px 0px 40px rgba(168,85,247,0.6)" }}
              whileTap={{ scale: 0.98 }}
              onClick={handleContinue}
              className="relative w-full py-5 rounded-[1.8rem] font-black text-sm uppercase tracking-[0.2em] bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 text-white shadow-[0_20px_40px_rgba(168,85,247,0.4)] flex items-center justify-center gap-3 overflow-hidden"
            >
              <motion.div 
                animate={{ x: ['-100%', '100%'] }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear", delay: 0.5 }}
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-12"
              />
              <span className="relative z-10">Continuer l'aventure</span>
              <ArrowRight className="relative z-10" size={20} />
            </motion.button>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
'use client'
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import { Shield, Eye, EyeOff, Lock } from 'lucide-react';
import { GalaxyBackground } from "../components/ui/GalaxyBackground";

const ADMIN_CODE = process.env.NEXT_PUBLIC_ADMIN_CODE || 'SEOUL2026';

export function AdminLoginScreen() {
  const router = useRouter();
  const [code, setCode] = useState('');
  const [showCode, setShowCode] = useState(false);
  const [error, setError] = useState('');
  const [shaking, setShaking] = useState(false);

  const handleSubmit = () => {
    if (code.toUpperCase() === ADMIN_CODE.toUpperCase()) {
      sessionStorage.setItem('admin_auth', 'true');
      router.push('/admin');
    } else {
      setError('Code incorrect');
      setShaking(true);
      setTimeout(() => { setShaking(false); setError(''); }, 1000);
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-[#000007]">
      <GalaxyBackground />

      <div className="relative z-10 px-6 w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-purple-600 to-pink-500 flex items-center justify-center shadow-2xl">
            <Shield className="text-white" size={36} />
          </div>
          <h1 className="text-3xl font-black text-white italic uppercase tracking-tighter">
            Zone Admin
          </h1>
          <p className="text-white/40 text-sm mt-2">Entrez le code d'accès</p>
        </motion.div>

        <motion.div
          animate={shaking ? { x: [-10, 10, -10, 10, 0] } : {}}
          transition={{ duration: 0.4 }}
          className="space-y-4"
        >
          <div className="bg-white/5 border border-white/10 rounded-3xl px-5 py-4 flex items-center gap-3 focus-within:border-purple-500/50 transition-colors">
            <Lock size={18} className="text-white/30 flex-shrink-0" />
            <input
              type={showCode ? 'text' : 'password'}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
              placeholder="••••••••"
              className="flex-1 bg-transparent text-white font-black text-xl outline-none tracking-widest placeholder:text-white/10"
            />
            <button onClick={() => setShowCode(!showCode)} className="text-white/30 hover:text-white transition-colors">
              {showCode ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {error && (
            <p className="text-red-400 text-xs font-black text-center uppercase tracking-widest">{error}</p>
          )}

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSubmit}
            disabled={!code.trim()}
            className={`w-full py-5 rounded-3xl font-black text-sm uppercase italic tracking-widest transition-all ${
              code.trim()
                ? 'bg-gradient-to-r from-purple-600 via-pink-500 to-blue-500 text-white shadow-2xl'
                : 'bg-white/5 text-white/20'
            }`}
          >
            Accéder au Panel
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
}
'use client'
import { useState, useEffect } from 'react';
import { motion } from 'motion/react';

export function EventCountdown() {
  const [mounted, setMounted] = useState(false);
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    setMounted(true);
    
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const target = new Date('2026-05-23T13:00:00').getTime();
      const distance = target - now;

      if (distance < 0) {
        clearInterval(timer);
        return;
      }

      setTimeLeft({
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000),
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Ne rien afficher côté serveur
  if (!mounted) return null;

  return (
    <div className="flex justify-center gap-4 mt-6">
      {[
        { label: 'Jours', val: timeLeft.days },
        { label: 'Hrs', val: timeLeft.hours },
        { label: 'Min', val: timeLeft.minutes },
        { label: 'Sec', val: timeLeft.seconds },
      ].map((unit, i) => (
        <motion.div
          key={i}
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.1 }}
          className="w-20 h-20 rounded-2xl bg-white/5 border border-white/10 flex flex-col items-center justify-center backdrop-blur-xl"
        >
          <span className="text-white text-xl font-bold tabular-nums">
            {String(unit.val).padStart(2, '0')}
          </span>
          <span className="text-white/40 text-[9px] font-bold uppercase tracking-widest mt-1">
            {unit.label}
          </span>
        </motion.div>
      ))}
    </div>
  );
}
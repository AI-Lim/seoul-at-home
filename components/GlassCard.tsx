'use client'
import { ReactNode } from 'react';
import { motion } from 'motion/react';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  variant?: 'default' | 'elevated' | 'subtle';
}

export function GlassCard({ children, className = '', onClick, variant = 'default' }: GlassCardProps) {
  const variants = {
    default: 'bg-white/10 backdrop-blur-xl border border-white/20 shadow-xl',
    elevated: 'bg-white/15 backdrop-blur-2xl border border-white/30 shadow-2xl',
    subtle: 'bg-white/5 backdrop-blur-lg border border-white/10 shadow-lg',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`rounded-3xl ${variants[variant]} ${className}`}
      onClick={onClick}
    >
      {children}
    </motion.div>
  );
}

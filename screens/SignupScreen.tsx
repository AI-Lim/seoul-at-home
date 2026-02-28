'use client'
import { useState } from 'react';
import { useRouter } from 'next/navigation'; // Si tu utilises React Router 6+
import { motion } from 'motion/react';
import { Mail, Phone, User, ArrowRight, ArrowLeft, ShieldCheck } from 'lucide-react';
import { useBooking } from '../context/BookingContext';
import { GalaxyBackground } from "../components/ui/GalaxyBackground";

export function SignupScreen() {
  const router = useRouter();
  const { booking, updateBooking } = useBooking();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
  });

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  try {
    const userRes = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: formData.email,
        name: formData.name,
        phone: formData.phone,
      })
    });
    const userData = await userRes.json();

    // Utilisateur existe déjà avec booking actif → rediriger vers login
    if (userData.shouldLogin) {
      alert(userData.error);
      router.push('/login');
      return;
    }

    if (!userData.success) throw new Error(userData.error);

    // Créer la réservation
    const bookingRes = await fetch('/api/booking', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: userData.userId,
        selectedPass: booking.selectedPass,
        passPrice: booking.passPrice,
      })
    });
    const bookingData = await bookingRes.json();
    if (!bookingData.success) throw new Error(bookingData.error);

    updateBooking({
      userId: userData.userId,
      bookingId: bookingData.bookingId,
      userName: formData.name,
      userEmail: formData.email,
      userPhone: formData.phone,
    });

    router.push('/identity');

  } catch (error) {
    console.error('Signup error:', error);
  }
};

  const isValid = formData.email && formData.phone;

  return (
    <div className="relative min-h-screen flex flex-col overflow-hidden bg-[#000007]">
      <GalaxyBackground />

      <div className="absolute top-[-10%] right-[-10%] w-64 h-64 bg-blue-600/20 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-64 h-64 bg-purple-600/20 blur-[100px] pointer-events-none" />

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
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent mb-4 italic">
            Votre Profil
          </h1>
          <p className="text-white/60 leading-relaxed">
            Ces informations lieront votre futur nom coréen à votre ticket sécurisé.
          </p>
        </motion.div>

        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          onSubmit={handleSubmit}
          className="space-y-5 mb-10"
        >
          {[
            { id: 'name', label: 'Nom Complet', icon: User, type: 'text', placeholder: 'Eunwoo', required: false },
            { id: 'email', label: 'Adresse Email', icon: Mail, type: 'email', placeholder: 'seoul@kpop.com', required: true },
            { id: 'phone', label: 'Numéro de Téléphone', icon: Phone, type: 'tel', placeholder: '+229 -- -- -- --', required: true }
          ].map((field) => (
            <div 
              key={field.id}
              className="group relative bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[1.5rem] p-4 transition-all duration-300 focus-within:border-purple-500/50 focus-within:bg-white/10"
            >
              <label className="flex items-center gap-2 text-white/40 text-xs font-bold uppercase tracking-tighter mb-1 ml-1 group-focus-within:text-purple-400 transition-colors">
                {/* @ts-ignore - Pour éviter les erreurs de typage sur l'icône dans un tableau */}
                <field.icon size={14} />
                {field.label} {field.required && <span className="text-pink-500">*</span>}
              </label>
              <input
                type={field.type}
                required={field.required}
                // @ts-ignore
                value={formData[field.id]}
                onChange={(e) => setFormData({ ...formData, [field.id]: e.target.value })}
                placeholder={field.placeholder}
                className="w-full bg-transparent text-white placeholder:text-white/20 outline-none text-lg font-medium px-1 py-1"
              />
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-[1px] bg-gradient-to-r from-transparent via-purple-500 to-transparent group-focus-within:w-2/3 transition-all duration-500" />
            </div>
          ))}

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-start gap-3 bg-white/5 border border-white/5 rounded-2xl p-4"
          >
            <ShieldCheck className="text-blue-400 shrink-0" size={20} />
            <p className="text-white/40 text-[11px] leading-tight">
              Vos données sont chiffrées. Votre identité coréenne sera générée de manière unique et attachée à ce compte.
            </p>
          </motion.div>

          <motion.button
            whileHover={isValid ? { scale: 1.02 } : {}}
            whileTap={isValid ? { scale: 0.98 } : {}}
            type="submit"
            disabled={!isValid}
            className={`group relative w-full py-5 px-8 rounded-[1.5rem] font-black text-lg flex items-center justify-center gap-3 transition-all duration-500 overflow-hidden ${
              isValid
                ? 'bg-gradient-to-r from-purple-600 via-pink-500 to-blue-500 text-white shadow-[0_20px_40px_rgba(168,85,247,0.3)]'
                : 'bg-white/5 text-white/20 cursor-not-allowed border border-white/5'
            }`}
          >
            {isValid && (
              <motion.div 
                animate={{ x: ['-100%', '100%'] }}
                transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 pointer-events-none"
              />
            )}
            <span className="relative z-10">Créer Mon Identité</span>
            <ArrowRight className={`relative z-10 transition-transform duration-300 ${isValid ? 'group-hover:translate-x-2' : ''}`} size={22} />
          </motion.button>
        </motion.form>

        {/* Footer Link - AJOUTÉ ICI */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-center"
        >
          <button 
            onClick={() => router.push('/login')} // Chemin vers ta page de connexion
            className="text-white/30 text-sm hover:text-white transition-colors underline-offset-4 hover:underline"
          >
            Déjà un compte ? <span className="text-purple-400 font-bold">Connectez-vous</span>
          </button>
        </motion.div>
      </div>
    </div>
  );
}
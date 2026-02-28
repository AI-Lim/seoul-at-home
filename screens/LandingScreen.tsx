'use client'
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { Calendar, MapPin, Clock, Sparkles, Ticket } from "lucide-react";

const bgImage = "/bg.jpeg";
const logo = "/logo.png";
import { GalaxyBackground } from "../components/ui/GalaxyBackground";
import { EventCountdown } from "../components/ui/EventCountdown";

export function LandingScreen() {
  const router = useRouter();

  return (
    <div className="relative min-h-screen flex flex-col overflow-hidden bg-black">

      {/* 🌌 Galaxy Background */}
      <GalaxyBackground />

      {/* ================= HERO SECTION ================= */}
      <div className="relative z-10 min-h-screen flex items-center justify-center">

        {/* Background Image */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <img
            src={bgImage}
            alt="Seoul At Home"
            className="w-full h-full object-cover object-[center_30%] "
          />

          {/* Grand dégradé noir vers le bas */}
          <div
            className="
              absolute left-0 right-0 top-0
              h-[140%]
              pointer-events-none
              bg-gradient-to-t
              from-[#000007]
              via-[#000007]/85
              to-transparent
            "
          />
        </div>

        {/* Hero Content */}
        <div className="text-center px-6 max-w-md mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            {/* Icon */}
<motion.div
  initial={{ opacity: 0, y: -20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.8 }}
  className="mb-8 flex justify-center relative"
>

  {/* ✨ Lumière au-dessus */}
  <div
    className="
      absolute -top-20
      w-52 h-52
      bg-purple-500/30
      blur-3xl
      rounded-full
      pointer-events-none
    "
  />

  {/* 🧊 Glass floating card */}
  <motion.div
    animate={{ y: [0, -10, 0] }}
    transition={{
      duration: 4,
      repeat: Infinity,
      ease: "easeInOut"
    }}
    className="
      relative
      px-1 py-1
      rounded-3xl
      bg-white/10
      backdrop-blur-2xl
      border border-white/20
      shadow-[0_0_50px_rgba(168,85,247,0.35)]
    "
  >
    {/* glow derrière */}
    <div
      className="
        absolute inset-0
        rounded-1xl
        bg-gradient-to-r
        from-purple-500/20
        via-pink-500/20
        to-blue-500/20
        blur-xl
        -z-10
      "
    />

    {/* 🖼 LOGO IMAGE */}
    <img
      src={logo}
      alt="Seoul At Home Logo"
      className="
       w-20 h-20
        rounded-3xl
        object-contain
        drop-shadow-[0_0_15px_rgba(255,255,255,0.4)]
      "
    />
  </motion.div>
</motion.div>


            {/* Title */}
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent mb-4 italic">
              <p>K-VIBE</p>
              <p>SEOUL AT HOME</p>
            </h1>

            {/* Description */}
            <p className="text-white/80 text-lg mb-8 leading-relaxed">
              Participez à un événment dédié au fan de culture coréenne et Kpop avec des passionnés comme vous.
              Une expérience K-pop immersive et personnalisée.
            </p>

            {/* Button */}
           {/* Buttons */}
<div className="flex flex-col gap-3 items-center">
  <motion.button
    whileHover={{
      scale: 1.05,
      boxShadow: "0px 0px 30px rgba(168,85,247,0.6)",
    }}
    whileTap={{ scale: 0.95 }}
    onClick={() => router.push("/pass-selection")}
    className="flex items-center justify-center gap-3 bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 text-white font-bold py-3 px-8 rounded-2xl shadow-2xl shadow-purple-500/50 mx-auto"
  >
    <Ticket className="w-6 h-6 stroke-[2.2]" />
    <span className="text-lg">Get My Pass</span>
  </motion.button>

  <motion.button
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    onClick={() => router.push("/login")}
    className="flex items-center justify-center gap-2 text-white/40 hover:text-white transition-colors text-sm font-bold uppercase tracking-widest"
  >
    <span>J'ai déjà un compte</span>
  </motion.button>
</div>
            {/* Countdown */}
            <EventCountdown />

            {/* Limited seats */}
            <motion.p
              animate={{ opacity: [0.6, 1, 0.6] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="text-white/60 text-sm mt-4"
            >
              Places limitées
            </motion.p>
          </motion.div>
        </div>
      </div>
      {/* ================= END HERO ================= */}


      {/* ================= EVENT DETAILS ================= */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.8 }}
        className="relative z-10 pb-16 px-6"
      >
        {/* Petit gradient derrière le contenu */}
        <div
          className="
            absolute inset-x-0 top-0
            h-40
            -z-10
            bg-gradient-to-b
            from-[#000007]
            via-[#000007]/90
            to-transparent
          "
        />

        <div className="max-w-md mx-auto">

          {/* Experience Card */}
          <div className="mb-8 bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-6">
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <Sparkles className="text-pink-400" size={24} />
              L'Expérience
            </h2>

            <p className="text-white/70 leading-relaxed mb-4">
              Seoul At Home n'est pas qu'un simple événement K-pop.
              C'est une immersion totale dans la culture coréenne.
            Vous vivez une expérience
              unique et personnalisée.
            </p>

            <p className="text-white/70 leading-relaxed">
              Vivez une soirée inoubliable mêlant jeu, bouffe,
              ambiance K-culture authentique et expériences digitales innovantes.
            </p>
          </div>

          {/* Event Info */}
          <div className="grid grid-cols-1 gap-3">
            {[
              { icon: Calendar, label: "Date", value: "23 Mai 2026", color: "purple" },
              { icon: Clock, label: "Heure", value: "13h00 - 22h00", color: "blue" },
              { icon: MapPin, label: "Lieu", value: "A confirmé", color: "pink" },
            ].map(({ icon: Icon, label, value, color }) => (
              <div
                key={label}
                className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-2xl p-4 flex items-center gap-4"
              >
                <div
                  className={`w-12 h-12 rounded-xl bg-${color}-500/20 flex items-center justify-center`}
                >
                  <Icon className={`text-${color}-300`} size={24} />
                </div>

                <div>
                  <div className="text-white/60 text-sm">{label}</div>
                  <div className="text-white font-semibold">{value}</div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </motion.div>
      {/* ================= END DETAILS ================= */}

    </div>
  );
}

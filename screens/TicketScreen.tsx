'use client'
import { useEffect, useState, useRef } from 'react';
import { motion } from 'motion/react';
import { Download, Share2, MapPin, Calendar, Clock, Check, Sparkles, Ticket } from 'lucide-react';
import { useBooking } from '../context/BookingContext';
import { GalaxyBackground } from "../components/ui/GalaxyBackground";
import QRCode from 'qrcode';

export function TicketScreen() {
  const { booking } = useBooking();
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [qrReady, setQrReady] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const ticketRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const qrData = JSON.stringify({
      id: booking.ticketId,
      name: booking.koreanIdentity?.koreanName,
      pass: booking.selectedPass,
    });

    // ✅ On génère le QR en base64 data URL — pas de CORS, lisible par html-to-image
    QRCode.toDataURL(qrData, {
      width: 400,
      margin: 2,
      color: { dark: '#000000', light: '#FFFFFF' },
      errorCorrectionLevel: 'H',
    }).then((url) => {
      setQrCodeUrl(url);
      setQrReady(true);
    });
  }, [booking]);

  const getImageBlob = async (): Promise<Blob> => {
    if (!qrReady) throw new Error('QR pas encore prêt');
    const { toBlob } = await import('html-to-image');
    const node = ticketRef.current!;

    // Attendre que le QR soit bien rendu dans le DOM
    await new Promise((r) => setTimeout(r, 100));

    const blob = await toBlob(node, {
      pixelRatio: 3,
      backgroundColor: '#0a0a1a',
      style: { borderRadius: '3rem' },
      // Exclure le shimmer animé
      filter: (el) => {
        if (el instanceof HTMLElement && el.classList.contains('shimmer-ignore')) return false;
        return true;
      },
      onclone: (cloned: HTMLElement) => {
        // Figer toutes les animations
        const allEls = Array.from(cloned.querySelectorAll('*')) as HTMLElement[];
        allEls.forEach((el) => {
          el.style.animation = 'none';
          el.style.transition = 'none';
          if (el.classList.contains('shimmer-ignore')) el.style.display = 'none';
        });

        // ✅ S'assurer que l'image QR utilise bien le data URL (pas une URL externe)
        const qrImg = cloned.querySelector('img[data-qr]') as HTMLImageElement;
        if (qrImg && qrCodeUrl) {
          qrImg.src = qrCodeUrl;
          qrImg.style.display = 'block';
          qrImg.style.width = '128px';
          qrImg.style.height = '128px';
        }

        // Override couleurs oklab Tailwind v4
        const style = document.createElement('style');
        style.innerHTML = `
          *, *::before, *::after { animation: none !important; transition: none !important; }
          .text-white { color: #ffffff !important; }
          .text-black { color: #000000 !important; }
          .bg-white { background-color: #ffffff !important; }
          .text-cyan-400 { color: #22d3ee !important; }
          .text-purple-400 { color: #c084fc !important; }
          .text-pink-400 { color: #f472b6 !important; }
          .text-white\\/40 { color: rgba(255,255,255,0.4) !important; }
          .text-white\\/50 { color: rgba(255,255,255,0.5) !important; }
          .text-white\\/60 { color: rgba(255,255,255,0.6) !important; }
          .text-white\\/20 { color: rgba(255,255,255,0.2) !important; }
          .text-white\\/30 { color: rgba(255,255,255,0.3) !important; }
          .text-black\\/20 { color: rgba(0,0,0,0.2) !important; }
          .bg-\\[\\#0a0a1a\\] { background-color: #0a0a1a !important; }
          .bg-\\[\\#0c0c1e\\] { background-color: #0c0c1e !important; }
          .border-white\\/20 { border-color: rgba(255,255,255,0.2) !important; }
          .border-white\\/10 { border-color: rgba(255,255,255,0.1) !important; }
        `;
        cloned.appendChild(style);
      },
    });

    if (!blob) throw new Error('Blob null');
    return blob;
  };

  const handleDownload = async () => {
    if (!ticketRef.current || downloading || !qrReady) return;
    setDownloading(true);
    try {
      const blob = await getImageBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `soul-pass-${booking.koreanIdentity?.koreanName || 'ticket'}.png`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Erreur export ticket :', err);
    } finally {
      setDownloading(false);
    }
  };

  const handleShare = async () => {
    if (!ticketRef.current || !qrReady) return;
    try {
      const blob = await getImageBlob();
      const file = new File([blob], 'soul-pass.png', { type: 'image/png' });
      if (navigator.share && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: 'Mon Soul Pass — Seoul At Home 2026',
          text: 'Je serai là ! 🎉 Seoul At Home 2026',
          files: [file],
        });
      } else {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'soul-pass.png';
        link.click();
        URL.revokeObjectURL(url);
      }
    } catch (err) {
      console.error('Erreur partage :', err);
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col overflow-hidden bg-[#000007]">
      <GalaxyBackground />

      <div className="relative z-10 px-6 py-10 max-w-md mx-auto w-full pb-20">

        {/* Header succès */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <motion.div
              initial={{ scale: 0 }} animate={{ scale: 1 }}
              className="w-16 h-16 rounded-full bg-cyan-500/20 flex items-center justify-center border border-cyan-400/50 shadow-[0_0_20px_rgba(6,182,212,0.3)]"
            >
              <Check className="text-cyan-400" size={32} strokeWidth={3} />
            </motion.div>
          </div>
          <h1 className="text-2xl font-black text-white italic uppercase tracking-tighter">
            Votre Soul Pass est prêt !
          </h1>
          <p className="text-white/40 text-[10px] font-bold uppercase tracking-[0.3em] mt-1">
            Présentez-le à l'entrée
          </p>
        </motion.div>

        {/* TICKET — ref sur ce div stable */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="relative group mb-10"
        >
          <div
            ref={ticketRef}
            className="relative rounded-[3rem] overflow-hidden bg-[#0a0a1a] border border-white/20 shadow-2xl"
          >
            {/* Header holographique */}
            <div className="relative p-8 pb-10 overflow-hidden">
              <div
                className="absolute inset-0"
                style={{
                  background: 'linear-gradient(135deg, rgba(147,51,234,0.3) 0%, rgba(219,39,119,0.3) 50%, rgba(37,99,235,0.3) 100%)'
                }}
              />
              {/* Shimmer — exclu de la capture */}
              <motion.div
                animate={{ x: ['-100%', '100%'] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
                className="shimmer-ignore absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -skew-x-12 pointer-events-none"
              />

              <div className="relative z-10 flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Sparkles className="text-cyan-400" size={16} />
                    <span className="text-[10px] font-black text-white/60 uppercase tracking-[0.4em]">
                      Seoul At Home
                    </span>
                  </div>
                  <h2 className="text-3xl font-black text-white italic tracking-tighter uppercase">
                    Édition 2026
                  </h2>
                </div>
                <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                  <Ticket className="text-white/40" size={24} />
                </div>
              </div>

              {/* Identity */}
              <div
                className="mt-8 rounded-[2rem] p-[1px] shadow-lg"
                style={{ background: 'linear-gradient(90deg, #a855f7, #ec4899, #06b6d4)' }}
              >
                <div className="bg-[#0c0c1e] rounded-[1.95rem] p-5 flex items-center gap-5">
                  <div
                    className="text-5xl font-bold text-white flex-shrink-0"
                    style={{ textShadow: '0 0 10px rgba(255,255,255,0.3)' }}
                  >
                    {booking.koreanIdentity?.hangul}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[9px] font-black text-purple-400 uppercase tracking-widest mb-1 italic">
                      Nom Coréen
                    </p>
                    <h3 className="text-xl font-black text-white uppercase italic leading-none">
                      {booking.koreanIdentity?.koreanName}
                    </h3>
                    <p className="text-white/40 text-[10px] mt-1 truncate italic">
                      "{booking.koreanIdentity?.meaning}"
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Perforation */}
            <div className="relative flex items-center px-4">
              <div className="w-6 h-6 rounded-full bg-[#000007] -ml-7 border-r border-white/20 flex-shrink-0" />
              <div className="flex-1 border-t-2 border-dashed border-white/10" />
              <div className="w-6 h-6 rounded-full bg-[#000007] -mr-7 border-l border-white/20 flex-shrink-0" />
            </div>

            {/* QR & Infos */}
            <div
              className="p-8"
              style={{ background: 'linear-gradient(to bottom, transparent, rgba(0,0,0,0.4))' }}
            >
              <div className="grid grid-cols-2 gap-6 mb-8">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Calendar size={14} className="text-cyan-400 flex-shrink-0" />
                    <span className="text-[10px] font-bold text-white/50 uppercase tracking-tighter">
                      23 Mai 2026
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock size={14} className="text-pink-400 flex-shrink-0" />
                    <span className="text-[10px] font-bold text-white/50 uppercase tracking-tighter">
                      13:00 - 22:00
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin size={14} className="text-purple-400 flex-shrink-0" />
                    <span className="text-[10px] font-bold text-white/50 uppercase tracking-tighter italic">
                      CALAVI-ZOPAH
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[9px] font-black text-white/30 uppercase mb-1">Pass Type</p>
                  <div className="inline-block bg-white text-black text-[10px] font-black px-3 py-1 rounded-full italic uppercase">
                    {booking.selectedPass?.replace('-', ' ')}
                  </div>
                </div>
              </div>

              {/* ✅ QR Code — data-qr pour le cibler dans onclone */}
              <div className="rounded-3xl bg-white p-4 flex flex-col items-center">
                {qrCodeUrl ? (
                  <img
                    src={qrCodeUrl}
                    alt="QR Code Soul Pass"
                    data-qr="true"
                    className="w-32 h-32"
                    style={{ imageRendering: 'pixelated', display: 'block' }}
                  />
                ) : (
                  <div className="w-32 h-32 bg-gray-100 rounded-xl animate-pulse" />
                )}
                <div className="mt-2 text-center">
                  <p className="text-[9px] font-black text-black/20 tracking-[0.5em] mb-1 italic uppercase">
                    Digital Security ID
                  </p>
                  <p className="text-[11px] font-mono font-bold text-black tracking-tighter">
                    {booking.ticketId}
                  </p>
                </div>
              </div>

              {/* Footer ticket */}
              <div className="mt-8 flex justify-between items-end">
                <div>
                  <p className="text-[10px] font-black text-white/20 uppercase tracking-widest">Status</p>
                  <div className="flex items-center gap-1 mt-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                    <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-tighter">
                      Seoul-Pass Active
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-black text-white/20 uppercase tracking-widest">
                    Total Payé
                  </p>
                  <p className="text-xl font-black text-white italic">
                    {booking.passPrice?.toLocaleString()} F
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Actions */}
       
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleShare}
            disabled={downloading || !qrReady}
           className="
w-full
flex items-center justify-center gap-3
py-4 px-6
bg-white/10 border border-white/20
text-white
rounded-2xl
font-black text-sm uppercase italic
backdrop-blur-xl
disabled:opacity-50
mx-auto
"
          >
           {downloading
              ? <span className="text-xs">Génération...</span>
              : !qrReady
              ? <span className="text-xs">Chargement...</span>
              : <><Download size={20} /> Télécharger</>
            
        }
</motion.button>

        <p className="text-center text-white/30 text-[10px] font-bold uppercase tracking-widest leading-relaxed px-10">
          Un récapitulatif a été envoyé sur{' '}
          <span className="text-white/60">{booking.userEmail}</span>.
          À bientôt au Seoul At Home !
        </p>
      </div>
    </div>
  );
}
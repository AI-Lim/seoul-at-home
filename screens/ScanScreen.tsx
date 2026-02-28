'use client'
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { QrCode, CheckCircle, XCircle, ArrowLeft, RefreshCw, ShieldCheck, AlertTriangle, KeyRound } from 'lucide-react';
import { GalaxyBackground } from "../components/ui/GalaxyBackground";

export function ScanScreen() {
  const router = useRouter();
  const [scanResult, setScanResult] = useState<any>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState('');
  const [manualCode, setManualCode] = useState('');
  const [showManual, setShowManual] = useState(false);
  const scannerRef = useRef<any>(null);
  const scannerDivId = 'qr-reader';

  const startScanner = async () => {
    setError('');
    setIsScanning(true);

    try {
      const { Html5Qrcode } = await import('html5-qrcode');
      const scanner = new Html5Qrcode(scannerDivId);
      scannerRef.current = scanner;

      await scanner.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        async (decodedText: string) => {
          await scanner.stop();
          setIsScanning(false);
          await validateTicket(decodedText);
        },
        () => {} // erreur silencieuse pendant scan
      );
    } catch (e: any) {
      setIsScanning(false);
      setError('Impossible d\'accéder à la caméra. Utilisez la saisie manuelle.');
    }
  };

  const stopScanner = async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
      } catch (e) {}
      scannerRef.current = null;
    }
    setIsScanning(false);
  };

  const validateTicket = async (code: string) => {
  setIsValidating(true);
  try {
    // Parser le JSON du QR code si nécessaire
    let ticketCode = code.trim();
    try {
      const parsed = JSON.parse(code);
      if (parsed.id) ticketCode = parsed.id;
    } catch {
      // c'est déjà un code brut, on garde tel quel
    }

    const response = await fetch('/api/ticket/validate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ticketCode })
    });
//API_USER a26144b7-22e6-4f6e-ac89-d80a5c5139c0    {"apiKey":""}
    const data = await response.json();

    setScanResult({
      valid: data.valid,
      reason: data.reason,
      ticket: data.ticket,
      user: data.user,
      koreanIdentity: data.koreanIdentity,
      pass: data.pass,
      timestamp: new Date().toLocaleTimeString('fr-FR'),
    });
  } catch (e) {
    setError('Erreur de connexion au serveur');
  } finally {
    setIsValidating(false);
  }
};

  const handleManualValidate = async () => {
    if (!manualCode.trim()) return;
    await validateTicket(manualCode.trim());
  };

  const reset = async () => {
    await stopScanner();
    setScanResult(null);
    setManualCode('');
    setError('');
    setShowManual(false);
  };

  useEffect(() => {
    return () => { stopScanner(); };
  }, []);

  const passLabel = (pass: string) => {
    if (pass === 'seoul-entry') return 'Seoul Entry Pass — 7 000 F';
    if (pass === 'neon-vibe') return 'Neon Vibe Pass — 10 000 F';
    return pass;
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#000007]">
      <GalaxyBackground />

      <div className="relative z-10 px-6 py-12 max-w-md mx-auto w-full pb-10">

        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={() => { stopScanner(); router.push('/admin'); }}
          className="mb-8 flex items-center gap-2 text-white/40 hover:text-white transition-colors"
        >
          <ArrowLeft size={20} />
          <span className="text-[10px] font-black uppercase tracking-[0.3em]">Retour Admin</span>
        </motion.button>

        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-white/5 border border-white/20 flex items-center justify-center backdrop-blur-xl relative">
            <QrCode className="text-purple-400" size={32} />
            {isScanning && (
              <motion.div
                animate={{ opacity: [0, 1, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="absolute inset-0 rounded-2xl bg-purple-500/20"
              />
            )}
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent mb-2 italic tracking-tight">
            Gate Control
          </h1>
          <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.2em] italic">
            Vérification de l'accès
          </p>
        </div>

        <AnimatePresence mode="wait">

          {/* ── VALIDATING ── */}
          {isValidating && (
            <motion.div
              key="validating"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-20"
            >
              <RefreshCw className="text-cyan-400 animate-spin mx-auto mb-4" size={48} />
              <p className="text-cyan-400 font-black uppercase tracking-widest text-sm animate-pulse">
                Vérification en cours...
              </p>
            </motion.div>
          )}

          {/* ── SCANNER UI ── */}
          {!scanResult && !isValidating && (
            <motion.div
              key="scanner-ui"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              {/* Zone caméra QR */}
              <div className="relative bg-white/5 border border-white/10 rounded-[2.5rem] overflow-hidden backdrop-blur-3xl">
                
                {/* div pour html5-qrcode */}
                <div 
                  id={scannerDivId} 
                  className={`w-full ${isScanning ? 'block' : 'hidden'}`}
                  style={{ minHeight: '300px' }}
                />

                {/* Placeholder quand pas de scan */}
                {!isScanning && (
                  <div className="p-8 text-center">
                    <div className="relative border-2 border-white/10 rounded-2xl p-12 mb-6 overflow-hidden">
                      <motion.div
                        animate={{ top: ['0%', '100%', '0%'] }}
                        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                        className="absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent z-20"
                      />
                      <div className="absolute top-2 left-2 w-5 h-5 border-t-2 border-l-2 border-cyan-400" />
                      <div className="absolute top-2 right-2 w-5 h-5 border-t-2 border-r-2 border-cyan-400" />
                      <div className="absolute bottom-2 left-2 w-5 h-5 border-b-2 border-l-2 border-cyan-400" />
                      <div className="absolute bottom-2 right-2 w-5 h-5 border-b-2 border-r-2 border-cyan-400" />
                      <QrCode className="text-white/20 mx-auto" size={64} />
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={startScanner}
                      className="w-full py-4 bg-white text-black font-black text-sm uppercase italic rounded-2xl shadow-xl hover:bg-cyan-400 transition-colors"
                    >
                      📷 Démarrer la Caméra
                    </motion.button>
                  </div>
                )}

                {/* Bouton stop */}
                {isScanning && (
                  <div className="p-4">
                    <motion.button
                      whileTap={{ scale: 0.97 }}
                      onClick={stopScanner}
                      className="w-full py-3 bg-white/10 border border-white/20 text-white font-black text-xs uppercase rounded-2xl"
                    >
                      Arrêter la caméra
                    </motion.button>
                  </div>
                )}
              </div>

              {/* Erreur */}
              {error && (
                <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-2xl px-4 py-3">
                  <AlertTriangle size={14} className="text-red-400 flex-shrink-0" />
                  <p className="text-red-400 text-xs font-bold">{error}</p>
                </div>
              )}

              {/* Saisie manuelle */}
              <button
                onClick={() => setShowManual(!showManual)}
                className="w-full flex items-center justify-center gap-2 text-white/30 hover:text-white transition-colors py-2"
              >
                <KeyRound size={14} />
                <span className="text-[10px] font-black uppercase tracking-widest">
                  {showManual ? 'Masquer' : 'Saisie manuelle du code'}
                </span>
              </button>

              <AnimatePresence>
                {showManual && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="bg-white/5 border border-white/10 rounded-2xl px-4 py-3 mb-3 focus-within:border-cyan-500/50 transition-colors">
                      <p className="text-white/30 text-[9px] font-black uppercase tracking-widest mb-1">Code Ticket</p>
                      <input
                        type="text"
                        value={manualCode}
                        onChange={(e) => setManualCode(e.target.value.toUpperCase())}
                        onKeyDown={(e) => e.key === 'Enter' && handleManualValidate()}
                        placeholder="SAH-XXXXXXXXXXXX"
                        className="w-full bg-transparent text-white font-mono text-sm outline-none placeholder:text-white/10 uppercase"
                      />
                    </div>
                    <motion.button
                      whileTap={{ scale: 0.97 }}
                      onClick={handleManualValidate}
                      disabled={!manualCode.trim()}
                      className={`w-full py-4 rounded-2xl font-black text-sm uppercase italic transition-all ${
                        manualCode.trim()
                          ? 'bg-gradient-to-r from-purple-600 to-pink-500 text-white'
                          : 'bg-white/5 text-white/20'
                      }`}
                    >
                      Valider manuellement
                    </motion.button>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex items-center justify-center gap-2 text-white/20 pt-2">
                <ShieldCheck size={14} />
                <span className="text-[9px] font-black uppercase tracking-widest">K-Shield Protocol v.2.6</span>
              </div>
            </motion.div>
          )}

          {/* ── RÉSULTAT ── */}
          {scanResult && !isValidating && (
            <motion.div
              key="scan-result"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div className={`relative rounded-[2.5rem] border p-8 backdrop-blur-3xl overflow-hidden ${
                scanResult.valid
                  ? 'border-cyan-500/50 bg-cyan-500/5'
                  : 'border-red-500/50 bg-red-500/5'
              }`}>
                <div className="absolute top-4 right-5">
                  <span className="text-white/20 text-[9px] font-mono">{scanResult.timestamp}</span>
                </div>

                {/* Status */}
                <div className="text-center mb-8">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', damping: 15 }}
                    className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4 ${
                      scanResult.valid
                        ? 'bg-cyan-500 shadow-[0_0_40px_rgba(6,182,212,0.5)]'
                        : 'bg-red-500 shadow-[0_0_40px_rgba(239,68,68,0.5)]'
                    }`}
                  >
                    {scanResult.valid
                      ? <CheckCircle className="text-white" size={48} />
                      : <XCircle className="text-white" size={48} />
                    }
                  </motion.div>

                  <h2 className={`text-3xl font-black italic uppercase tracking-tighter ${
                    scanResult.valid ? 'text-cyan-400' : 'text-red-400'
                  }`}>
                    {scanResult.valid ? '✅ Accès Confirmé' : '❌ Accès Refusé'}
                  </h2>

                  {!scanResult.valid && scanResult.reason && (
                    <p className="text-red-300/70 text-xs mt-2 font-bold italic">{scanResult.reason}</p>
                  )}
                </div>

                {/* Infos participant */}
                {scanResult.valid && scanResult.koreanIdentity && (
                  <div className="space-y-3">
                    <div className="bg-white/5 rounded-2xl p-5 border border-white/5 text-center">
                      <p className="text-white/30 text-[9px] font-black uppercase tracking-widest mb-3">Détenteur du Pass</p>
                      <div className="text-5xl font-bold text-white mb-2">{scanResult.koreanIdentity.hangul}</div>
                      <p className="text-xl font-black text-white uppercase italic tracking-tighter">{scanResult.koreanIdentity.koreanName}</p>
                      <p className="text-cyan-400/60 text-xs mt-1 italic">{scanResult.koreanIdentity.pronunciation}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                        <p className="text-white/30 text-[9px] font-black uppercase mb-2">Pass</p>
                        <p className="text-xs font-black text-purple-400 uppercase italic leading-tight">{passLabel(scanResult.pass)}</p>
                      </div>
                      <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                        <p className="text-white/30 text-[9px] font-black uppercase mb-2">Nom réel</p>
                        <p className="text-xs font-black text-white italic truncate">{scanResult.user?.name || '—'}</p>
                      </div>
                    </div>

                    <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                      <p className="text-white/30 text-[9px] font-black uppercase mb-1">ID Ticket</p>
                      <p className="text-[11px] font-mono text-white/60">{scanResult.ticket?.ticketCode}</p>
                    </div>

                    <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-2xl p-4 text-center">
                      <p className="text-cyan-400 font-black text-sm">🎉 Bienvenue à Seoul At Home 2026 !</p>
                      <p className="text-white/50 text-xs mt-1 italic">Participant confirmé — Bonne soirée !</p>
                    </div>
                  </div>
                )}
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={reset}
                className="w-full py-5 bg-gradient-to-r from-purple-600 via-pink-500 to-blue-500 text-white font-black text-sm uppercase italic rounded-2xl shadow-2xl"
              >
                Scanner le suivant
              </motion.button>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}
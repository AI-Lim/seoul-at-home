'use client'
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, Ticket, TrendingUp, DollarSign, QrCode, 
  ArrowLeft, Activity, Search, 
  Settings, Save, RefreshCw, CheckCircle, XCircle, Trash2
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { GalaxyBackground } from "../components/ui/GalaxyBackground";

const useCountdown = (targetDate: string) => {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = new Date(targetDate).getTime() - now;
      if (distance < 0) { clearInterval(timer); return; }
      setTimeLeft({
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000),
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [targetDate]);
  return { timeLeft, mounted };
};

export function AdminDashboard() {
  const router = useRouter();
  const { timeLeft, mounted } = useCountdown('2026-05-23T13:00:00');
  const [stats, setStats] = useState<any>(null);
  const [availability, setAvailability] = useState<any>(null);
  const [editConfig, setEditConfig] = useState({ seoulEntryTotal: 100, neonVibeTotal: 50 });
  const [showConfigPanel, setShowConfigPanel] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'overview' | 'pending' | 'tickets'>('overview');
  const [pendingPayments, setPendingPayments] = useState<any[]>([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [processing, setProcessing] = useState<string | null>(null);
  const [rejectNote, setRejectNote] = useState('');
  const [showRejectInput, setShowRejectInput] = useState<string | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [resetting, setResetting] = useState(false);

  useEffect(() => {
    fetchAll();
    const interval = setInterval(fetchPending, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchAll = async () => {
    await Promise.all([fetchStats(), fetchConfig(), fetchPending()]);
  };

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/admin/stats');
      const data = await res.json();
      if (data.success) setStats(data);
    } catch (e) { console.error(e); }
  };

  const fetchConfig = async (forceUpdate = false) => {
    try {
      const res = await fetch('/api/admin/config');
      const data = await res.json();
      if (data.success) {
        setAvailability(data.availability);
        if (!showConfigPanel || forceUpdate) {
          setEditConfig({
            seoulEntryTotal: data.config.seoulEntryTotal,
            neonVibeTotal: data.config.neonVibeTotal,
          });
        }
      }
    } catch (e) { console.error(e); }
  };

  const fetchPending = async () => {
    try {
      const res = await fetch('/api/payment/pending');
      const data = await res.json();
      if (data.success) {
        setPendingPayments(data.payments);
        setPendingCount(data.count);
      }
    } catch (e) { console.error(e); }
  };

  const handlePaymentAction = async (paymentId: string, action: 'approve' | 'reject') => {
    setProcessing(paymentId);
    try {
      const res = await fetch('/api/payment/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentId,
          action,
          adminNote: action === 'reject' ? rejectNote : undefined
        })
      });
      const data = await res.json();
      if (data.success) {
        await fetchAll();
        setShowRejectInput(null);
        setRejectNote('');
      }
    } catch (e) { console.error(e); }
    finally { setProcessing(null); }
  };

  const saveConfig = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/admin/config', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editConfig)
      });
      const data = await res.json();
      if (data.success) {
        await fetchConfig(true);
        setSaveSuccess(true);
        setTimeout(() => { setSaveSuccess(false); setShowConfigPanel(false); }, 1500);
      }
    } catch (e) { console.error(e); }
    finally { setSaving(false); }
  };

  const handleReset = async () => {
    setResetting(true);
    try {
      const res = await fetch('/api/admin/reset', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        await fetchAll();
        setShowResetConfirm(false);
      }
    } catch (e) { console.error(e); }
    finally { setResetting(false); }
  };

  const filteredTickets = stats?.recentTickets?.filter((t: any) =>
    !searchQuery ||
    t.booking?.koreanIdentity?.koreanName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.ticketCode?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#000007]">
      <GalaxyBackground />

      {/* HEADER */}
      <div className="relative z-10 px-5 pt-12 pb-4 max-w-md mx-auto">
        <div className="flex items-center justify-between mb-1">
          <button onClick={() => router.push('/')} className="flex items-center gap-2 text-white/30 hover:text-white transition-colors">
            <ArrowLeft size={16} />
            <span className="text-[9px] font-black uppercase tracking-[0.3em]">Accueil</span>
          </button>
          <button
            onClick={() => { sessionStorage.removeItem('admin_auth'); router.push('/admin-login'); }}
            className="text-[9px] font-black text-red-400/50 uppercase tracking-widest hover:text-red-400 transition-colors"
          >
            Déconnexion
          </button>
          <div className="flex items-center gap-2">
            <motion.button whileTap={{ scale: 0.9 }} onClick={fetchAll}
              className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
              <RefreshCw size={14} className="text-white/40" />
            </motion.button>
            <motion.button whileTap={{ scale: 0.9 }} onClick={() => setShowConfigPanel(!showConfigPanel)}
              className={`w-9 h-9 rounded-xl border flex items-center justify-center transition-all ${showConfigPanel ? 'bg-white border-white' : 'bg-white/5 border-white/10'}`}>
              <Settings size={14} className={showConfigPanel ? 'text-black' : 'text-white/40'} />
            </motion.button>
            <motion.button whileTap={{ scale: 0.9 }} onClick={() => router.push('/scan')}
              className="h-9 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-pink-500 flex items-center gap-2">
              <QrCode size={14} className="text-white" />
              <span className="text-[10px] font-black text-white uppercase tracking-wider">Scan</span>
            </motion.button>
          </div>
        </div>

        <h1 className="text-3xl font-black text-white italic tracking-tighter uppercase mt-4">
          K-Panel <span className="text-purple-400">Admin</span>
        </h1>

        {mounted && (
          <div className="flex items-center gap-1 mt-2">
            <Activity size={10} className="text-green-400 animate-pulse" />
            <span className="text-green-400 text-[9px] font-black uppercase tracking-widest mr-2">Live</span>
            {[
              { val: timeLeft.days, l: 'j' },
              { val: timeLeft.hours, l: 'h' },
              { val: timeLeft.minutes, l: 'm' },
              { val: timeLeft.seconds, l: 's' },
            ].map((u, i) => (
              <div key={i} className="flex items-baseline gap-0.5">
                <span className="text-white font-black text-sm tabular-nums">{String(u.val).padStart(2, '0')}</span>
                <span className="text-white/30 text-[9px] font-bold">{u.l}</span>
                {i < 3 && <span className="text-white/20 text-xs mx-0.5">:</span>}
              </div>
            ))}
            <span className="text-white/30 text-[9px] ml-2 italic">avant Seoul At Home</span>
          </div>
        )}
      </div>

      <div className="relative z-10 px-5 max-w-md mx-auto pb-24">

        {/* TABS */}
        <div className="flex gap-2 mb-6 mt-2">
          {[
            { id: 'overview', label: 'Vue générale' },
            { id: 'pending', label: 'Paiements', badge: pendingCount },
            { id: 'tickets', label: 'Tickets' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-wider transition-all relative ${
                activeTab === tab.id ? 'bg-white text-black' : 'bg-white/5 text-white/40 border border-white/10'
              }`}
            >
              {tab.label}
              {tab.badge ? (
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-500 text-white text-[9px] font-black flex items-center justify-center">
                  {tab.badge}
                </span>
              ) : null}
            </button>
          ))}
        </div>

        {/* CONFIG PANEL */}
        <AnimatePresence>
          {showConfigPanel && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden mb-6"
            >
              <div className="bg-white/5 border border-white/10 rounded-3xl p-5">
                <p className="text-white/60 text-[10px] font-black uppercase tracking-widest mb-4">⚙️ Capacité</p>
                <div className="space-y-4">
                  {[
                    { key: 'seoulEntryTotal', label: 'Seoul Entry Pass', sold: availability?.seoulEntry?.sold || 0 },
                    { key: 'neonVibeTotal', label: 'Neon Vibe Pass', sold: availability?.neonVibe?.sold || 0 },
                  ].map(({ key, label, sold }) => (
                    <div key={key} className="bg-white/5 rounded-2xl p-4">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-white font-black text-xs italic uppercase">{label}</p>
                        <span className="text-white/30 text-[10px]">{sold} vendus</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <input
                          type="number"
                          value={editConfig[key as keyof typeof editConfig]}
                          onChange={(e) => setEditConfig(prev => ({ ...prev, [key]: parseInt(e.target.value) || 0 }))}
                          className="flex-1 bg-white/10 border-2 border-white/20 rounded-xl px-3 py-2 text-white font-black text-lg outline-none text-center"
                        />
                        <div className="text-right">
                          <p className="text-white/30 text-[9px] uppercase">Restants</p>
                          <p className={`font-black text-lg ${(editConfig[key as keyof typeof editConfig] - sold) <= 5 ? 'text-red-400' : 'text-green-400'}`}>
                            {Math.max(0, editConfig[key as keyof typeof editConfig] - sold)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <motion.button whileTap={{ scale: 0.97 }} onClick={saveConfig} disabled={saving}
                  className={`w-full mt-4 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 ${
                    saveSuccess ? 'bg-green-500 text-white' : 'bg-gradient-to-r from-purple-600 to-pink-500 text-white'
                  }`}>
                  <Save size={14} />
                  {saving ? 'Sauvegarde...' : saveSuccess ? '✓ Sauvegardé !' : 'Sauvegarder'}
                </motion.button>
                <button
                  onClick={() => setShowResetConfirm(true)}
                  className="w-full mt-3 py-3 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 bg-red-500/10 border border-red-500/20 text-red-400"
                >
                  <Trash2 size={14} />
                  Réinitialiser la base de données
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* RESET CONFIRM */}
        <AnimatePresence>
          {showResetConfirm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center px-6"
            >
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                className="bg-[#0c0c1e] border border-red-500/30 rounded-3xl p-8 max-w-sm w-full text-center"
              >
                <Trash2 className="text-red-400 mx-auto mb-4" size={40} />
                <h3 className="text-white font-black text-xl italic uppercase mb-2">Réinitialiser ?</h3>
                <p className="text-white/50 text-sm mb-6">
                  Toutes les données (users, bookings, tickets, paiements) seront supprimées. La config des places sera conservée.
                </p>
                <div className="flex gap-3">
                  <button onClick={() => setShowResetConfirm(false)}
                    className="flex-1 py-3 rounded-2xl bg-white/10 text-white font-black text-sm uppercase">
                    Annuler
                  </button>
                  <button onClick={handleReset} disabled={resetting}
                    className="flex-1 py-3 rounded-2xl bg-red-500 text-white font-black text-sm uppercase">
                    {resetting ? '...' : 'Confirmer'}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── TAB OVERVIEW ── */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Tickets', value: stats?.stats?.totalTickets ?? '—', icon: Ticket, color: 'from-purple-500 to-pink-500' },
                { label: 'Participants', value: stats?.stats?.totalUsers ?? '—', icon: Users, color: 'from-blue-500 to-cyan-500' },
                { label: 'Revenus', value: stats?.stats?.totalRevenue ? `${(stats.stats.totalRevenue / 1000).toFixed(0)}K F` : '—', icon: DollarSign, color: 'from-green-500 to-emerald-500' },
                { label: 'Tontines', value: stats?.stats?.tontineBookings ?? '—', icon: TrendingUp, color: 'from-orange-500 to-yellow-500' },
              ].map((s, i) => {
                const Icon = s.icon;
                return (
                  <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                    className="bg-white/5 border border-white/10 rounded-3xl p-5">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center mb-3`}>
                      <Icon size={18} className="text-white" />
                    </div>
                    <p className="text-2xl font-black text-white italic tracking-tighter">{s.value}</p>
                    <p className="text-white/30 text-[9px] font-black uppercase tracking-widest mt-0.5">{s.label}</p>
                  </motion.div>
                );
              })}
            </div>

            {availability && (
              <div className="bg-white/5 border border-white/10 rounded-3xl p-5">
                <p className="text-white/40 text-[10px] font-black uppercase tracking-widest mb-4">Disponibilité</p>
                <div className="space-y-5">
                  {[
                    { label: 'Seoul Entry', data: availability.seoulEntry, color: 'from-purple-500 to-blue-400' },
                    { label: 'Neon Vibe', data: availability.neonVibe, color: 'from-pink-500 to-purple-600' },
                  ].map(({ label, data, color }) => (
                    <div key={label}>
                      <div className="flex justify-between items-center mb-2">
                        <p className="text-white font-black text-xs italic uppercase">{label}</p>
                        <p className={`font-black text-lg ${data.remaining / data.total <= 0.1 ? 'text-red-400' : data.remaining / data.total <= 0.3 ? 'text-orange-400' : 'text-green-400'}`}>
                          {data.remaining} <span className="text-white/20 text-xs">/ {data.total}</span>
                        </p>
                      </div>
                      <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                        <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min(100, (data.sold / data.total) * 100)}%` }}
                          transition={{ duration: 1 }} className={`h-full bg-gradient-to-r ${color}`} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-gradient-to-br from-orange-500/10 to-yellow-500/10 border border-orange-500/20 rounded-3xl p-5">
              <p className="text-orange-400 font-black text-[10px] uppercase tracking-widest mb-4 flex items-center gap-2">
                <TrendingUp size={12} /> Pulse Tontine
              </p>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: 'En cours', val: stats?.stats?.tontineBookings ?? '—' },
                  { label: 'Complétés', val: stats?.stats?.paidBookings ?? '—' },
                  { label: 'Revenus', val: stats?.stats?.totalRevenue ? `${(stats.stats.totalRevenue / 1000).toFixed(0)}K` : '—' },
                ].map((item, i) => (
                  <div key={i} className="bg-white/5 rounded-2xl p-3 text-center">
                    <p className="text-white font-black text-xl italic">{item.val}</p>
                    <p className="text-orange-400/50 text-[8px] font-black uppercase tracking-wider mt-1">{item.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── TAB PAIEMENTS EN ATTENTE ── */}
        {activeTab === 'pending' && (
          <div className="space-y-4">
            {pendingPayments.length === 0 ? (
              <div className="text-center py-16">
                <CheckCircle className="text-green-400 mx-auto mb-4" size={48} />
                <p className="text-white/40 font-black uppercase text-sm italic">Aucun paiement en attente</p>
              </div>
            ) : (
              pendingPayments.map((payment: any) => {
                const booking = payment.booking;
                const identity = booking?.koreanIdentity;
                const tontine = booking?.tontine;
                const isTontine = booking?.status === 'TONTINE' || tontine;

                return (
                  <motion.div key={payment.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    className="bg-white/5 border border-white/10 rounded-3xl p-5 space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-xl font-bold text-white">
                        {identity?.hangul?.charAt(0) || '?'}
                      </div>
                      <div className="flex-1">
                        <p className="text-white font-black text-sm italic uppercase">{identity?.koreanName || 'Inconnu'}</p>
                        <p className="text-white/40 text-xs">{booking?.user?.name} • {booking?.user?.phone}</p>
                      </div>
                      {isTontine && (
                        <span className="bg-yellow-500/20 border border-yellow-500/30 text-yellow-400 text-[9px] font-black uppercase px-2 py-1 rounded-xl">
                          🪙 Tontine
                        </span>
                      )}
                    </div>

                    <div className="bg-white/5 rounded-2xl p-4 space-y-2">
                      <div className="flex justify-between">
                        <span className="text-white/40 text-[10px] uppercase font-black">Montant</span>
                        <span className="text-white font-black">{payment.amount.toLocaleString()} F</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/40 text-[10px] uppercase font-black">Opérateur</span>
                        <span className="text-white font-black uppercase">{payment.operator}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/40 text-[10px] uppercase font-black">Numéro envoi</span>
                        <span className="text-white font-black">{payment.senderPhone || payment.phone}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/40 text-[10px] uppercase font-black">Pass</span>
                        <span className="text-purple-400 font-black text-[10px] uppercase">{booking?.selectedPass?.replace('-', ' ')}</span>
                      </div>
                      {isTontine && tontine && (
                        <div className="flex justify-between">
                          <span className="text-white/40 text-[10px] uppercase font-black">Progression tontine</span>
                          <span className="text-yellow-400 font-black text-xs">
                            {tontine.amountPaid?.toLocaleString()} / {booking?.totalAmount?.toLocaleString()} F
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-white/40 text-[10px] uppercase font-black">Date</span>
                        <span className="text-white/60 text-[10px]">{new Date(payment.createdAt).toLocaleString('fr-FR')}</span>
                      </div>
                    </div>

                    {showRejectInput === payment.id ? (
                      <div className="space-y-2">
                        <input type="text" value={rejectNote} onChange={(e) => setRejectNote(e.target.value)}
                          placeholder="Raison du rejet (optionnel)"
                          className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white text-sm outline-none" />
                        <div className="flex gap-2">
                          <button onClick={() => setShowRejectInput(null)}
                            className="flex-1 py-3 rounded-2xl bg-white/10 text-white font-black text-xs uppercase">
                            Annuler
                          </button>
                          <button onClick={() => handlePaymentAction(payment.id, 'reject')} disabled={processing === payment.id}
                            className="flex-1 py-3 rounded-2xl bg-red-500 text-white font-black text-xs uppercase">
                            {processing === payment.id ? '...' : 'Confirmer rejet'}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <button onClick={() => setShowRejectInput(payment.id)}
                          className="flex-1 py-3 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 font-black text-xs uppercase flex items-center justify-center gap-2">
                          <XCircle size={14} /> Rejeter
                        </button>
                        <button onClick={() => handlePaymentAction(payment.id, 'approve')} disabled={processing === payment.id}
                          className="flex-1 py-3 rounded-2xl bg-green-500 text-white font-black text-xs uppercase flex items-center justify-center gap-2">
                          {processing === payment.id
                            ? <RefreshCw size={14} className="animate-spin" />
                            : <><CheckCircle size={14} /> Valider</>
                          }
                        </button>
                      </div>
                    )}
                  </motion.div>
                );
              })
            )}
          </div>
        )}

        {/* ── TAB TICKETS ── */}
        {activeTab === 'tickets' && (
          <div className="space-y-4">

            {/* Tontines en cours */}
            {stats?.tontineInProgress?.length > 0 && (
              <div>
                <p className="text-orange-400 text-[10px] font-black uppercase tracking-widest mb-3 flex items-center gap-2">
                  <TrendingUp size={12} /> Tontines en cours ({stats.tontineInProgress.length})
                </p>
                <div className="space-y-3 mb-6">
                  {stats.tontineInProgress.map((b: any) => {
                    // ✅ Source unique : tontine.amountPaid mis à jour par confirm
                    const amountPaid = b.tontine?.amountPaid || 0;
                    const total = b.totalAmount || b.passPrice || 0;
                    const percent = total > 0 ? Math.min(100, Math.round((amountPaid / total) * 100)) : 0;
                    const remaining = Math.max(0, total - amountPaid);
                    const paidBoxes = b.tontine?.paidBoxes || 0;
                    const totalBoxes = Math.floor(total / 1000);

                    return (
                      <div key={b.id} className="bg-orange-500/10 border border-orange-500/20 rounded-3xl p-4">
                        {/* Header */}
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 rounded-2xl bg-orange-500/20 flex items-center justify-center text-lg font-bold text-white flex-shrink-0">
                            {b.koreanIdentity?.hangul?.charAt(0) || '?'}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-white font-black text-xs italic uppercase truncate">
                              {b.koreanIdentity?.koreanName || 'Inconnu'}
                            </p>
                            <p className="text-white/40 text-[9px] truncate">
                              {b.user?.name} • {b.user?.phone}
                            </p>
                          </div>
                          <span className="bg-orange-500/20 text-orange-400 text-[9px] font-black uppercase px-2 py-1 rounded-xl flex-shrink-0">
                            {percent}%
                          </span>
                        </div>

                        {/* Barre de progression */}
                        <div className="space-y-1 mb-3">
                          <div className="flex justify-between text-[9px] font-black uppercase">
                            <span className="text-white/40">Versé</span>
                            <span className="text-orange-400">
                              {amountPaid.toLocaleString()} / {total.toLocaleString()} F
                            </span>
                          </div>
                          <div className="h-2.5 bg-white/5 rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${percent}%` }}
                              transition={{ duration: 0.8 }}
                              className="h-full bg-gradient-to-r from-orange-500 to-yellow-400 rounded-full"
                            />
                          </div>
                          <div className="flex justify-between text-[9px]">
                            <span className="text-white/30">🪙 {paidBoxes} / {totalBoxes} boxes</span>
                            <span className="text-white/40">Reste {remaining.toLocaleString()} F</span>
                          </div>
                        </div>

                        {/* Historique versements */}
                        {b.payments?.length > 0 && (
                          <div className="bg-white/5 rounded-2xl p-3 space-y-1.5">
                            <p className="text-white/30 text-[8px] font-black uppercase tracking-widest mb-2">
                              Historique versements
                            </p>
                            {b.payments.map((p: any, i: number) => (
                              <div key={p.id} className="flex justify-between items-center">
                                <span className="text-white/40 text-[9px]">
                                  Versement {i + 1} — {p.operator?.toUpperCase()}
                                </span>
                                <div className="flex items-center gap-2">
                                  <span className="text-green-400 text-[9px] font-black">
                                    +{p.amount.toLocaleString()} F
                                  </span>
                                  <span className="text-white/20 text-[8px]">
                                    {new Date(p.paidAt || p.createdAt).toLocaleDateString('fr-FR')}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        <p className="text-white/20 text-[9px] mt-2 uppercase font-black">
                          {b.selectedPass?.replace('-', ' ')}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Tickets générés */}
            <div className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden">
              <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between">
                <p className="text-white font-black text-sm italic uppercase">Tickets Générés</p>
                <button onClick={fetchStats}><RefreshCw size={14} className="text-white/30" /></button>
              </div>
              <div className="px-5 py-3 border-b border-white/5">
                <div className="flex items-center gap-2 bg-white/5 rounded-xl px-3 py-2">
                  <Search size={12} className="text-white/30" />
                  <input type="text" placeholder="Rechercher..." value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-transparent text-xs text-white outline-none flex-1 placeholder:text-white/20" />
                </div>
              </div>
              <div className="divide-y divide-white/5">
                {filteredTickets.length === 0 ? (
                  <div className="py-10 text-center text-white/20 text-xs italic">
                    Aucun ticket généré pour l'instant
                  </div>
                ) : (
                  filteredTickets.map((ticket: any, i: number) => (
                    <motion.div key={ticket.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}
                      className="px-5 py-4 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0">
                        <span className="text-white font-black text-sm">
                          {ticket.booking?.koreanIdentity?.hangul?.charAt(0) || '?'}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-black text-xs italic uppercase truncate">
                          {ticket.booking?.koreanIdentity?.koreanName || 'Inconnu'}
                        </p>
                        <p className="text-white/20 text-[9px] font-mono truncate">{ticket.ticketCode}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-[9px] font-black uppercase mb-0.5 text-cyan-400">✓ Payé</p>
                        <p className="text-white font-black text-xs italic">
                          {ticket.booking?.passPrice?.toLocaleString()} F
                        </p>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
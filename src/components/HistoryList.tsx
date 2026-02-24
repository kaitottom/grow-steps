import React, { useState, useRef, useEffect } from 'react';
import { GrowEntry } from '../hooks/useGrowData';
import {
    Calendar, ChevronDown, BarChart2, Target, AlertTriangle,
    Clock, Send, Sparkles, Trash2, Edit3
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { analyzeReflection } from '../utils/aiAnalyzer';

interface HistoryListProps {
    entries: GrowEntry[];
    onUpdate: (id: string, updates: Partial<GrowEntry>) => void;
    onDelete: (id: string) => void;
}

export const HistoryList: React.FC<HistoryListProps> = ({ entries, onUpdate, onDelete }) => {
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [reflectionId, setReflectionId] = useState<string | null>(null);
    const [learnings, setLearnings] = useState('');
    const [feelings, setFeelings] = useState('');
    const [nextSteps, setNextSteps] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
    const entryRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

    // Auto-scroll when an entry is selected
    useEffect(() => {
        if (selectedId && entryRefs.current[selectedId]) {
            setTimeout(() => {
                entryRefs.current[selectedId!]?.scrollIntoView({
                    behavior: 'smooth',
                    block: 'center'
                });
            }, 300);
        }
    }, [selectedId]);

    const openReflection = (id: string) => {
        setReflectionId(id);
        setLearnings('');
        setFeelings('');
        setNextSteps('');
    };

    const closeReflection = () => setReflectionId(null);

    const confirmDelete = () => {
        if (!deleteConfirmId) return;
        onDelete(deleteConfirmId);
        if (selectedId === deleteConfirmId) setSelectedId(null);
        setDeleteConfirmId(null);
    };

    const handleDeleteClick = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        setDeleteConfirmId(id);
        // Scroll to the entry being deleted to show context
        setTimeout(() => {
            entryRefs.current[id]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 100);
    };

    const submitReflection = () => {
        const l = learnings.trim();
        const f = feelings.trim();
        const n = nextSteps.trim();
        if (!l || !f || !n) {
            alert('全ての項目を入力してください');
            return;
        }
        if (!reflectionId) return;
        setIsSubmitting(true);
        const entry = entries.find(e => e.id === reflectionId);
        const reflectionData = { learnings: l, feelings: f, nextSteps: n };
        const aiFeedback = analyzeReflection(entry, reflectionData);

        onUpdate(reflectionId, {
            reflection: {
                completed: true,
                learnings: l,
                feelings: f,
                nextSteps: n,
                aiFeedback,
            }
        });
        setIsSubmitting(false);
        setReflectionId(null);
    };

    const reflectionEntry = entries.find(e => e.id === reflectionId);
    const deleteTarget = entries.find(e => e.id === deleteConfirmId);

    return (
        <div className="w-full max-w-3xl mx-auto">
            {/* ── Header ── */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-2xl font-extrabold flex items-center gap-2.5">
                        <Calendar className="text-blue-400" size={24} /> これまでの軌跡
                    </h2>
                    <p className="text-gray-500 text-sm mt-1">積み上げた一歩一歩が大きな成長に繋がります。</p>
                </div>
                {entries.length > 0 && (
                    <div className="bg-white/5 border border-white/8 px-4 py-2 rounded-xl text-center">
                        <p className="text-2xl font-black text-white">{entries.length}</p>
                        <p className="text-[9px] uppercase tracking-widest text-gray-500 font-bold leading-tight">記録数</p>
                    </div>
                )}
            </div>

            {/* ── Empty State ── */}
            {entries.length === 0 && (
                <div className="text-center py-20 border border-dashed border-white/12 rounded-2xl">
                    <Sparkles className="mx-auto text-gray-700 mb-3" size={32} />
                    <p className="text-gray-500">まだ記録がありません。最初の一歩を記しましょう！</p>
                </div>
            )}

            {/* ── Entry List ── */}
            <div className="space-y-4">
                {entries.map(entry => (
                    <motion.div
                        key={entry.id}
                        ref={el => entryRefs.current[entry.id] = el}
                        layout
                        className={`glass-card overflow-hidden border transition-all duration-300 ${selectedId === entry.id || deleteConfirmId === entry.id
                            ? 'border-blue-500/50 shadow-2xl shadow-blue-500/10 scale-[1.01]'
                            : 'border-white/6 hover:border-white/15'
                            }`}
                    >
                        {/* ── Entry Row ── */}
                        <div
                            onClick={() => setSelectedId(selectedId === entry.id ? null : entry.id)}
                            className="p-4 cursor-pointer flex items-center gap-3"
                        >
                            {/* Status Dot */}
                            <div className={`w-2 h-2 rounded-full shrink-0 ${entry.reflection.completed ? 'bg-green-400' : 'bg-amber-400'}`} />

                            {/* Main Info */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                    {entry.category && (
                                        <span className="px-2 py-0.5 rounded-md bg-blue-500/12 text-blue-400 text-[10px] font-black uppercase tracking-wider leading-5">
                                            {entry.category}
                                        </span>
                                    )}
                                    <span className="text-[11px] text-gray-600">{entry.date}</span>
                                </div>
                                <h3 className="text-base font-bold text-white mt-0.5 truncate">{entry.title}</h3>
                            </div>

                            {/* Right side: status badge + delete + chevron */}
                            <div className="flex items-center gap-1.5 md:gap-2 shrink-0">
                                <span className={`hidden md:inline text-[10px] px-2 py-0.5 rounded-full font-semibold ${entry.reflection.completed
                                    ? 'bg-green-500/12 text-green-400'
                                    : 'bg-amber-500/12 text-amber-400'
                                    }`}>
                                    {entry.reflection.completed ? '✓ 振り返り済' : '未振り返り'}
                                </span>
                                {/* Delete button — always visible */}
                                <button
                                    onClick={e => handleDeleteClick(e, entry.id)}
                                    className="p-2 md:p-1.5 rounded-lg text-gray-600 hover:text-red-400 hover:bg-red-400/10 transition-all"
                                    title="削除"
                                >
                                    <Trash2 size={18} className="md:size-4" />
                                </button>
                                <ChevronDown
                                    size={18}
                                    className={`text-gray-500 transition-transform duration-300 ${selectedId === entry.id ? 'rotate-180' : ''}`}
                                />
                            </div>
                        </div>

                        {/* ── Expanded Detail ── */}
                        <AnimatePresence>
                            {selectedId === entry.id && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.22 }}
                                    className="overflow-hidden"
                                >
                                    <div className="px-4 pb-5 border-t border-white/6 pt-4 space-y-3">
                                        {/* Priority Task */}
                                        <Section label="最優先タスク" icon={<Target size={11} />} color="text-blue-400">
                                            <p className="text-sm text-gray-200 leading-relaxed">{entry.priorityTask || '—'}</p>
                                            <p className="text-xs text-gray-600 mt-1">{entry.status || '—'} · {entry.availableTime || '—'}</p>
                                        </Section>

                                        {/* Obstacles */}
                                        <Section label="障害と対策" icon={<AlertTriangle size={11} />} color="text-yellow-400">
                                            <p className="text-xs text-gray-400">
                                                <span className="text-gray-600 font-semibold">内: </span>
                                                {entry.obstacles.internal || '—'}
                                                {entry.actions.internal ? <> <span className="text-gray-600">→</span> {entry.actions.internal}</> : ''}
                                            </p>
                                            <p className="text-xs text-gray-400 mt-0.5">
                                                <span className="text-gray-600 font-semibold">外: </span>
                                                {entry.obstacles.external || '—'}
                                                {entry.actions.external ? <> <span className="text-gray-600">→</span> {entry.actions.external}</> : ''}
                                            </p>
                                        </Section>

                                        {/* Micro Steps + SMART */}
                                        <div className="flex flex-col md:grid md:grid-cols-5 gap-3">
                                            <div className="md:col-span-2 bg-white/4 p-4 rounded-xl border border-white/5">
                                                <p className="text-[10px] text-purple-400 font-black uppercase tracking-widest mb-2 flex items-center gap-1">
                                                    <Clock size={10} /> 行動手順
                                                </p>
                                                <ul className="space-y-1.5 md:space-y-1">
                                                    {entry.microSteps.filter(s => s).map((s, i) => (
                                                        <li key={i} className="text-sm md:text-xs text-gray-400 flex gap-1.5">
                                                            <span className="text-gray-600 font-bold shrink-0">{i + 1}.</span> {s}
                                                        </li>
                                                    ))}
                                                    {!entry.microSteps.filter(s => s).length && <p className="text-xs text-gray-600">—</p>}
                                                </ul>
                                            </div>
                                            <div className="md:col-span-3 bg-white/4 p-4 rounded-xl border border-white/5">
                                                <p className="text-[10px] text-cyan-400 font-black uppercase tracking-widest mb-2 flex items-center gap-1">
                                                    <Send size={10} /> SMART計画
                                                </p>
                                                <p className="text-sm md:text-xs text-gray-300 leading-relaxed">{entry.smartPlan || '—'}</p>
                                            </div>
                                        </div>

                                        {/* Reflection */}
                                        {entry.reflection.completed ? (
                                            <div className="bg-green-500/5 p-6 rounded-2xl border border-green-500/10 space-y-6">
                                                <div className="flex items-center justify-between">
                                                    <p className="text-[12px] text-green-400 font-extrabold uppercase tracking-[0.2em] flex items-center gap-2">
                                                        <BarChart2 size={14} /> 振り返りレポート
                                                    </p>
                                                    <span className="text-[10px] text-gray-500 font-mono">Completed</span>
                                                </div>

                                                <div className="flex flex-col gap-6">
                                                    <div className="bg-white/4 p-6 rounded-2xl border border-white/5 hover:bg-white/6 transition-colors shadow-inner">
                                                        <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest mb-3 flex items-center gap-1.5">
                                                            <Sparkles size={12} className="text-blue-400" /> 学びと発見
                                                        </p>
                                                        <p className="text-gray-100 text-[16px] leading-relaxed font-semibold">{entry.reflection.learnings}</p>
                                                    </div>

                                                    <div className="grid md:grid-cols-2 gap-5">
                                                        <div className="bg-white/4 p-6 rounded-2xl border border-white/5 hover:bg-white/6 transition-colors">
                                                            <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest mb-3">率直な感想</p>
                                                            <p className="text-gray-200 text-[15px] leading-relaxed">{entry.reflection.feelings}</p>
                                                        </div>
                                                        <div className="bg-white/4 p-6 rounded-2xl border border-white/5 hover:bg-white/6 transition-colors">
                                                            <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest mb-3">今後のアクション</p>
                                                            <p className="text-gray-200 text-[15px] leading-relaxed">{entry.reflection.nextSteps}</p>
                                                        </div>
                                                    </div>
                                                </div>

                                                {entry.reflection.aiFeedback && (
                                                    <motion.div
                                                        initial={{ opacity: 0, y: 10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        className="mt-4 p-6 rounded-2xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/20 shadow-inner"
                                                    >
                                                        <p className="text-[10px] text-blue-400 font-black uppercase tracking-widest mb-3 flex items-center gap-2">
                                                            <Sparkles size={14} className="animate-pulse" /> AI 成長アドバイス
                                                        </p>
                                                        <p className="text-white/90 text-[15px] leading-relaxed font-medium italic">
                                                            "{entry.reflection.aiFeedback}"
                                                        </p>
                                                    </motion.div>
                                                )}
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => openReflection(entry.id)}
                                                className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-green-500 hover:opacity-90 active:scale-[0.98] rounded-xl font-bold text-sm flex items-center justify-center gap-2.5 shadow-lg shadow-green-600/15 transition-all"
                                            >
                                                <Edit3 size={18} /> この記録を振り返って次へ繋げる
                                            </button>
                                        )}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                ))}
            </div>

            {/* ── Delete Confirm Modal ── */}
            <AnimatePresence>
                {deleteConfirmId && deleteTarget && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
                        <motion.div
                            initial={{ scale: 0.92, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.92, opacity: 0 }}
                            transition={{ type: 'spring', stiffness: 350, damping: 28 }}
                            className="glass-card w-full max-w-sm p-5 md:p-6 shadow-2xl ring-1 ring-white/10"
                        >
                            <div className="text-center space-y-4">
                                <div className="w-12 h-12 rounded-full bg-red-500/15 text-red-400 flex items-center justify-center mx-auto">
                                    <Trash2 size={22} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-white">記録を削除しますか？</h3>
                                    <p className="text-sm text-gray-400 mt-1">「{deleteTarget.title}」を完全に削除します。</p>
                                    <p className="text-xs text-gray-600 mt-1">この操作は元に戻せません。</p>
                                </div>
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => setDeleteConfirmId(null)}
                                        className="flex-1 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 font-semibold text-sm transition-all"
                                    >
                                        キャンセル
                                    </button>
                                    <button
                                        onClick={confirmDelete}
                                        className="flex-1 py-3 rounded-xl bg-gradient-to-r from-red-600 to-red-500 text-white font-bold text-sm hover:opacity-90 active:scale-[0.98] transition-all shadow-lg shadow-red-600/20"
                                    >
                                        削除する
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* ── Reflection Modal ── */}
            <AnimatePresence>
                {reflectionId && reflectionEntry && (
                    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/80 backdrop-blur-md">
                        <motion.div
                            initial={{ scale: 0.94, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.94, opacity: 0, y: 20 }}
                            transition={{ type: 'spring', stiffness: 320, damping: 26 }}
                            className="glass-card w-full max-w-xl mx-4 my-8 p-6 shadow-2xl ring-1 ring-white/12"
                        >
                            {/* Modal Header */}
                            <div className="flex items-start gap-3 mb-5">
                                <div className="p-2.5 rounded-xl bg-green-500/15 text-green-400 shrink-0 mt-0.5">
                                    <BarChart2 size={22} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-white">振り返り</h3>
                                    <p className="text-gray-400 text-sm mt-0.5 truncate max-w-xs">{reflectionEntry.title}</p>
                                </div>
                            </div>

                            {/* Context */}
                            <div className="bg-white/4 p-3.5 rounded-xl border border-white/6 mb-5">
                                <p className="text-[10px] text-blue-400 font-black uppercase tracking-widest mb-1.5 flex items-center gap-1">
                                    <Target size={10} /> 行動した内容
                                </p>
                                <p className="text-gray-300 text-sm italic leading-relaxed">"{reflectionEntry.priorityTask}"</p>
                                {reflectionEntry.microSteps.filter(s => s).length > 0 && (
                                    <div className="flex flex-wrap gap-1.5 mt-2">
                                        {reflectionEntry.microSteps.filter(s => s).map((s, i) => (
                                            <span key={i} className="text-[10px] bg-white/5 border border-white/6 px-2 py-0.5 rounded-md text-gray-500">
                                                {i + 1}. {s}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Reflection Fields */}
                            <div className="space-y-4 mb-5">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-300 mb-1.5">
                                        1. 実行後の学び <span className="text-red-400">*</span>
                                        <span className="text-gray-600 font-normal text-xs ml-1">— 何が分かりましたか？</span>
                                    </label>
                                    <textarea
                                        className="w-full rounded-xl p-3.5 h-24 text-sm resize-none"
                                        placeholder="例: 思ったより時間がかからなかった。対策が効果的だった。"
                                        value={learnings}
                                        onChange={e => setLearnings(e.target.value)}
                                        autoFocus
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-300 mb-1.5">
                                            2. 率直な感想 <span className="text-red-400">*</span>
                                        </label>
                                        <textarea
                                            className="w-full rounded-xl p-3.5 h-24 text-sm resize-none"
                                            placeholder="例: 達成感があった。思ったより難しかった。"
                                            value={feelings}
                                            onChange={e => setFeelings(e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-300 mb-1.5">
                                            3. 今後の方針 <span className="text-red-400">*</span>
                                        </label>
                                        <textarea
                                            className="w-full rounded-xl p-3.5 h-24 text-sm resize-none"
                                            placeholder="例: このペースを維持する。次は○○から始める。"
                                            value={nextSteps}
                                            onChange={e => setNextSteps(e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>

                            <p className="text-[11px] text-gray-600 text-center mb-4 flex items-center justify-center gap-1">
                                <Sparkles size={10} /> 保存後、入力内容をもとにAIがフィードバックを生成します
                            </p>

                            {/* Action Buttons */}
                            <div className="flex gap-3">
                                <button
                                    onClick={closeReflection}
                                    className="flex-1 py-3.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 font-semibold text-sm transition-all"
                                >
                                    一時中断
                                </button>
                                <button
                                    onClick={submitReflection}
                                    disabled={isSubmitting}
                                    className="flex-[2] py-3.5 rounded-xl bg-gradient-to-r from-green-600 to-emerald-500 text-white font-bold text-sm shadow-lg shadow-green-600/20 hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50"
                                >
                                    {isSubmitting ? '保存中…' : '振り返りを保存してAIフィードバック'}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

// Helper: section block inside expanded entry
const Section = ({
    label, icon, color, children
}: {
    label: string;
    icon: React.ReactNode;
    color: string;
    children: React.ReactNode;
}) => (
    <div className="bg-white/4 p-3.5 rounded-xl border border-white/5">
        <p className={`text-[10px] font-black uppercase tracking-widest mb-2 flex items-center gap-1 ${color}`}>
            {icon} {label}
        </p>
        {children}
    </div>
);

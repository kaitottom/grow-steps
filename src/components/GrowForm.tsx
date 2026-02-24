import React, { useState } from 'react';
import { GrowEntry } from '../hooks/useGrowData';
import { CheckCircle, Clock, AlertTriangle, Target, Send, Plus, Trash2, ArrowRight, Edit2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface GrowFormProps {
    onAdd: (entry: GrowEntry) => void;
    onGoToHistory: () => void;
}

const STEPS = [
    { label: '準備', color: 'gray' },
    { label: '基本情報', color: 'blue' },
    { label: '現状', color: 'green' },
    { label: '障害と対策', color: 'yellow' },
    { label: '行動手順', color: 'purple' },
    { label: '行動計画', color: 'cyan' },
    { label: '確認・修正', color: 'emerald' },
];

export const GrowForm: React.FC<GrowFormProps> = ({ onAdd, onGoToHistory }) => {
    const [step, setStep] = useState(0); // 0=Intro, 1–5=inputs, 6=Review, 7=Done
    const [formData, setFormData] = useState<Partial<GrowEntry>>({
        id: crypto.randomUUID(),
        date: new Date().toISOString().split('T')[0],
        category: '',
        title: '',
        priorityTask: '',
        status: '',
        availableTime: '',
        obstacles: { internal: '', external: '' },
        actions: { internal: '', external: '' },
        microSteps: [''],
        smartPlan: '',
        reflection: { completed: false, learnings: '', feelings: '', nextSteps: '' },
    });

    const goToStep = (n: number) => setStep(n);
    const handleNext = () => setStep(s => s + 1);
    const handlePrev = () => setStep(s => Math.max(0, s - 1));

    const handleSubmit = () => {
        const finalEntry = { ...formData } as GrowEntry;
        onAdd(finalEntry);
        setStep(7);
    };

    const updateMicroStep = (index: number, value: string) => {
        const newSteps = [...(formData.microSteps || [])];
        newSteps[index] = value;
        setFormData(d => ({ ...d, microSteps: newSteps }));
    };

    const addMicroStep = () => {
        if ((formData.microSteps?.length || 0) < 5) {
            setFormData(d => ({ ...d, microSteps: [...(d.microSteps || []), ''] }));
        }
    };

    const removeMicroStep = (index: number) => {
        setFormData(d => ({ ...d, microSteps: d.microSteps?.filter((_, i) => i !== index) }));
    };

    // --- UI helpers ---
    const StepHeader = ({ icon, label, stepNum }: { icon: React.ReactNode; label: string; stepNum: string }) => (
        <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 rounded-xl bg-white/8 text-white/70">{icon}</div>
            <div>
                <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">{stepNum}</p>
                <h2 className="text-xl font-bold text-white">{label}</h2>
            </div>
        </div>
    );

    return (
        <div className="w-full max-w-2xl mx-auto">
            {/* ── Progress Bar (steps 1–6 only) ── */}
            {step >= 1 && step <= 6 && (
                <div className="mb-6 flex items-center gap-0">
                    {STEPS.slice(1).map((s, i) => {
                        const idx = i + 1;
                        const done = step > idx;
                        const active = step === idx;
                        return (
                            <React.Fragment key={idx}>
                                <div className="flex flex-col items-center flex-shrink-0">
                                    <div className={`w-7 h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center text-[10px] md:text-[11px] font-black transition-all duration-300
                                        ${active ? 'bg-blue-500 text-white ring-4 ring-blue-500/25' : done ? 'bg-green-500/70 text-white' : 'bg-white/8 text-gray-600'}`}>
                                        {done ? <CheckCircle size={14} /> : idx}
                                    </div>
                                    <span className={`hidden sm:block text-[9px] mt-1 font-semibold leading-tight text-center w-12 ${active ? 'text-blue-400' : done ? 'text-green-400/70' : 'text-gray-600'}`}>
                                        {s.label}
                                    </span>
                                </div>
                                {i < 5 && (
                                    <div className={`flex-1 h-[2px] mx-1 transition-all duration-500 ${step > idx ? 'bg-green-500/40' : 'bg-white/6'}`} />
                                )}
                            </React.Fragment>
                        );
                    })}
                </div>
            )}

            {/* ── Card ── */}
            <div className="glass-card p-6 md:p-8">
                <AnimatePresence mode="wait">
                    {/* STEP 0 — Intro */}
                    {step === 0 && (
                        <motion.div key="s0" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-5">
                            <div className="text-center">
                                <h2 className="text-2xl font-extrabold mb-1">記録の流れ</h2>
                                <p className="text-gray-400 text-sm">6ステップで今日の行動計画を作ります</p>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                {[
                                    { n: '①', label: '基本情報', desc: 'カテゴリ・タイトル', c: 'text-blue-400' },
                                    { n: '②', label: '現状把握', desc: '最優先タスク・進捗', c: 'text-green-400' },
                                    { n: '③', label: '障害と対策', desc: '内的・外的ブロッカー', c: 'text-yellow-400' },
                                    { n: '④', label: '行動手順', desc: '最大5つのアクション', c: 'text-purple-400' },
                                    { n: '⑤', label: 'SMART計画', desc: '具体的な今日の計画', c: 'text-cyan-400' },
                                    { n: '⑥', label: '確認・修正', desc: '内容確認後に保存', c: 'text-emerald-400' },
                                ].map((item) => (
                                    <div key={item.n} className="flex items-center gap-3 bg-white/4 p-4 rounded-xl border border-white/5">
                                        <span className={`text-xl font-black ${item.c} w-8 shrink-0`}>{item.n}</span>
                                        <div>
                                            <p className="text-sm font-semibold text-white leading-tight">{item.label}</p>
                                            <p className="text-[11px] text-gray-500">{item.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <button type="button" onClick={handleNext}
                                className="w-full py-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl font-bold text-base hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-xl shadow-blue-500/20">
                                入力を開始する <ArrowRight size={18} />
                            </button>
                        </motion.div>
                    )}

                    {/* STEP 1 — 基本情報 */}
                    {step === 1 && (
                        <motion.div key="s1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                            <StepHeader icon={<Target size={20} />} label="基本情報" stepNum="Step 1 / 5" />
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-300 mb-1.5">カテゴリ <span className="text-red-400">*</span></label>
                                    <input type="text" placeholder="例: 仕事、自己啓発、健康、趣味"
                                        className="w-full rounded-xl p-3.5 text-sm"
                                        value={formData.category}
                                        onChange={e => setFormData(d => ({ ...d, category: e.target.value }))}
                                        autoFocus />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-300 mb-1.5">今日取り組む内容 <span className="text-red-400">*</span></label>
                                    <input type="text" placeholder="例: Webアプリのログイン機能を実装する"
                                        className="w-full rounded-xl p-3.5 text-sm"
                                        value={formData.title}
                                        onChange={e => setFormData(d => ({ ...d, title: e.target.value }))} />
                                </div>
                                <p className="text-xs text-gray-600 flex items-center gap-1.5">
                                    <span>📅</span> 日付（{formData.date}）は自動設定されます
                                </p>
                            </div>
                        </motion.div>
                    )}

                    {/* STEP 2 — 現状 */}
                    {step === 2 && (
                        <motion.div key="s2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                            <StepHeader icon={<CheckCircle size={20} />} label="今日の現状" stepNum="Step 2 / 5" />
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-300 mb-1.5">最優先タスク <span className="text-red-400">*</span></label>
                                    <textarea placeholder="今日、最も前に進めたいことは何ですか？"
                                        className="w-full rounded-xl p-3.5 h-28 text-sm resize-none"
                                        value={formData.priorityTask}
                                        onChange={e => setFormData(d => ({ ...d, priorityTask: e.target.value }))}
                                        autoFocus />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-300 mb-1.5">現在の進み具合</label>
                                        <select className="w-full rounded-xl p-3.5 text-sm"
                                            value={formData.status}
                                            onChange={e => setFormData(d => ({ ...d, status: e.target.value }))}>
                                            <option value="">選択</option>
                                            <option value="未着手">未着手 (0%)</option>
                                            <option value="初期段階">初期段階 (1–20%)</option>
                                            <option value="進捗中">進捗中 (21–50%)</option>
                                            <option value="後半">後半 (51–80%)</option>
                                            <option value="最終調整">最終調整 (81–99%)</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-300 mb-1.5">使える時間</label>
                                        <input type="text" placeholder="例: 45分"
                                            className="w-full rounded-xl p-3.5 text-sm"
                                            value={formData.availableTime}
                                            onChange={e => setFormData(d => ({ ...d, availableTime: e.target.value }))} />
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* STEP 3 — 障害と対策 */}
                    {step === 3 && (
                        <motion.div key="s3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                            <StepHeader icon={<AlertTriangle size={20} />} label="障害と対策" stepNum="Step 3 / 5" />
                            <div className="space-y-4">
                                <div className="bg-blue-500/6 p-4 rounded-xl border border-blue-500/12">
                                    <p className="text-blue-300 font-semibold text-sm mb-3">🧠 内的要因（心理・スキル）</p>
                                    <div className="space-y-2">
                                        <input type="text" placeholder="障害の例: 不安感、やり方が分からない"
                                            className="w-full rounded-xl p-3 text-sm"
                                            value={formData.obstacles?.internal}
                                            onChange={e => setFormData(d => ({ ...d, obstacles: { ...d.obstacles!, internal: e.target.value } }))}
                                            autoFocus />
                                        <input type="text" placeholder="対策の例: まず5分だけ手を動かしてみる"
                                            className="w-full rounded-xl p-3 text-sm"
                                            value={formData.actions?.internal}
                                            onChange={e => setFormData(d => ({ ...d, actions: { ...d.actions!, internal: e.target.value } }))} />
                                    </div>
                                </div>
                                <div className="bg-purple-500/6 p-4 rounded-xl border border-purple-500/12">
                                    <p className="text-purple-300 font-semibold text-sm mb-3">🌍 外的要因（環境・他者）</p>
                                    <div className="space-y-2">
                                        <input type="text" placeholder="障害の例: 通知、呼びかけ"
                                            className="w-full rounded-xl p-3 text-sm"
                                            value={formData.obstacles?.external}
                                            onChange={e => setFormData(d => ({ ...d, obstacles: { ...d.obstacles!, external: e.target.value } }))} />
                                        <input type="text" placeholder="対策の例: 通知をオフにする"
                                            className="w-full rounded-xl p-3 text-sm"
                                            value={formData.actions?.external}
                                            onChange={e => setFormData(d => ({ ...d, actions: { ...d.actions!, external: e.target.value } }))} />
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* STEP 4 — マイクロステップ */}
                    {step === 4 && (
                        <motion.div key="s4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                            <StepHeader icon={<Clock size={20} />} label="最初の行動手順" stepNum="Step 4 / 5" />
                            <p className="text-gray-400 text-sm mb-4">迷わず動けるよう、最初のアクションを細かく分解します（最大5つ）</p>
                            <div className="space-y-2.5">
                                {formData.microSteps?.map((s, i) => (
                                    <div key={i} className="flex gap-2 items-center">
                                        <div className="w-8 h-8 shrink-0 bg-white/6 rounded-lg flex items-center justify-center font-bold text-gray-500 text-xs">{i + 1}</div>
                                        <input type="text"
                                            placeholder={i === 0 ? 'アクション 1（例: アプリを起動する）' : `アクション ${i + 1}`}
                                            className="flex-1 rounded-xl p-3 text-sm"
                                            value={s}
                                            onChange={e => updateMicroStep(i, e.target.value)}
                                            autoFocus={i === 0} />
                                        {i > 0 && (
                                            <button type="button" onClick={() => removeMicroStep(i)}
                                                className="p-2 text-gray-600 hover:text-red-400 hover:bg-red-400/8 rounded-lg transition-colors shrink-0">
                                                <Trash2 size={16} />
                                            </button>
                                        )}
                                    </div>
                                ))}
                                {(formData.microSteps?.length || 0) < 5 && (
                                    <button type="button" onClick={addMicroStep}
                                        className="w-full py-2.5 border border-dashed border-white/12 rounded-xl text-gray-500 hover:bg-white/4 hover:text-white transition-all flex items-center justify-center gap-2 text-sm">
                                        <Plus size={16} /> ステップを追加
                                    </button>
                                )}
                            </div>
                        </motion.div>
                    )}

                    {/* STEP 5 — SMART計画 */}
                    {step === 5 && (
                        <motion.div key="s5" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                            <StepHeader icon={<Send size={20} />} label="SMARTな行動計画" stepNum="Step 5 / 5" />
                            <p className="text-gray-400 text-sm mb-4">具体的・測定可能・期限付きの計画にしましょう</p>
                            <textarea
                                placeholder="例: 今日の21:00から書斎で、ログイン機能を1つ完成させる。完了の基準は動作確認まで。"
                                className="w-full rounded-xl p-4 h-44 text-sm resize-none"
                                value={formData.smartPlan}
                                onChange={e => setFormData(d => ({ ...d, smartPlan: e.target.value }))}
                                autoFocus />
                            <div className="mt-3 bg-white/4 rounded-xl p-3 border border-white/5">
                                <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-1.5">SMART チェック</p>
                                <div className="flex flex-wrap gap-2">
                                    {['S：具体的', 'M：測定可能', 'A：達成可能', 'R：関連性', 'T：期限付き'].map(t => (
                                        <span key={t} className="text-[10px] bg-white/5 px-2 py-1 rounded-md text-gray-500">{t}</span>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* STEP 6 — 確認・修正 */}
                    {step === 6 && (
                        <motion.div key="s6" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                            <div className="flex items-center gap-3 mb-5">
                                <div className="p-2.5 rounded-xl bg-emerald-500/15 text-emerald-400"><CheckCircle size={20} /></div>
                                <div>
                                    <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">最終確認</p>
                                    <h2 className="text-xl font-bold text-white">入力内容を確認する</h2>
                                </div>
                            </div>
                            <div className="space-y-2.5">
                                {/* 基本情報 */}
                                <ReviewRow
                                    label="基本情報" labelColor="text-blue-400"
                                    onEdit={() => goToStep(1)}
                                    content={<>
                                        <p className="text-sm text-white font-semibold">{formData.title || '（未入力）'}</p>
                                        <p className="text-xs text-gray-500 mt-0.5">{formData.category} · {formData.date}</p>
                                    </>}
                                />
                                {/* 現状 */}
                                <ReviewRow
                                    label="最優先タスク" labelColor="text-green-400"
                                    onEdit={() => goToStep(2)}
                                    content={<>
                                        <p className="text-sm text-gray-200 line-clamp-2">{formData.priorityTask || '（未入力）'}</p>
                                        <p className="text-xs text-gray-500 mt-0.5">{formData.status || '—'} · {formData.availableTime || '—'}</p>
                                    </>}
                                />
                                {/* 障害 */}
                                <ReviewRow
                                    label="障害と対策" labelColor="text-yellow-400"
                                    onEdit={() => goToStep(3)}
                                    content={<>
                                        <p className="text-xs text-gray-400">内: {formData.obstacles?.internal || '—'} → {formData.actions?.internal || '—'}</p>
                                        <p className="text-xs text-gray-400">外: {formData.obstacles?.external || '—'} → {formData.actions?.external || '—'}</p>
                                    </>}
                                />
                                {/* 行動手順 */}
                                <ReviewRow
                                    label="行動手順" labelColor="text-purple-400"
                                    onEdit={() => goToStep(4)}
                                    content={
                                        formData.microSteps?.filter(s => s).length
                                            ? formData.microSteps.filter(s => s).map((s, i) => (
                                                <p key={i} className="text-xs text-gray-400">{i + 1}. {s}</p>
                                            ))
                                            : <p className="text-xs text-gray-500">（未入力）</p>
                                    }
                                />
                                {/* SMART計画 */}
                                <ReviewRow
                                    label="SMART計画" labelColor="text-cyan-400"
                                    onEdit={() => goToStep(5)}
                                    content={<p className="text-sm text-gray-200 line-clamp-2">{formData.smartPlan || '（未入力）'}</p>}
                                />
                            </div>
                            <button type="button" onClick={handleSubmit}
                                className="w-full mt-6 py-4 rounded-2xl bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 text-white font-black text-base transition-all hover:opacity-90 active:scale-[0.98] shadow-xl shadow-blue-500/20 flex items-center justify-center gap-2.5">
                                <CheckCircle size={22} /> この内容で記録を確定する
                            </button>
                            <button type="button" onClick={handlePrev}
                                className="w-full mt-2 py-3 rounded-xl bg-white/5 hover:bg-white/8 text-gray-400 font-semibold transition-all text-sm">
                                ← 計画を修正する
                            </button>
                        </motion.div>
                    )}

                    {/* STEP 7 — Done */}
                    {step === 7 && (
                        <motion.div key="s7" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
                            <div className="text-center space-y-5 py-4">
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: 'spring', stiffness: 250, damping: 18 }}
                                    className="inline-block p-5 rounded-full bg-green-500/12 text-green-400">
                                    <CheckCircle size={56} />
                                </motion.div>
                                <div>
                                    <h2 className="text-2xl font-black">記録完了！</h2>
                                    <p className="text-gray-400 mt-1.5 text-sm">さあ、最初の一歩を踏み出しましょう。</p>
                                    <p className="text-gray-500 text-xs mt-1">行動後は「履歴」から振り返りを記入。AIがフィードバックします。</p>
                                </div>
                                <div className="bg-white/4 p-4 rounded-xl border border-white/8 text-left">
                                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1.5">今日の行動計画</p>
                                    <p className="text-gray-200 text-sm leading-relaxed">{formData.smartPlan || '—'}</p>
                                </div>
                                <button type="button" onClick={onGoToHistory}
                                    className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4 rounded-xl font-bold text-base hover:opacity-90 active:scale-[0.98] transition-all shadow-xl flex items-center justify-center gap-2.5">
                                    履歴で振り返りを記録する <ArrowRight size={20} />
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* ── Navigation Buttons (steps 1–5) ── */}
                {step >= 1 && step <= 5 && (
                    <div className="flex gap-3 mt-7">
                        <button type="button" onClick={handlePrev}
                            className="flex-1 py-3.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 font-semibold transition-all text-sm">
                            ← 戻る
                        </button>
                        <button type="button" onClick={handleNext}
                            className="flex-[2] py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold transition-all shadow-lg shadow-blue-600/20 text-sm">
                            次へ →
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

// Helper component for review rows
const ReviewRow = ({
    label, labelColor, content, onEdit
}: {
    label: string;
    labelColor: string;
    content: React.ReactNode;
    onEdit: () => void;
}) => (
    <div className="bg-white/4 p-3.5 rounded-xl border border-white/6 flex justify-between items-start gap-3">
        <div className="flex-1 min-w-0">
            <p className={`text-[10px] uppercase tracking-widest font-black mb-1.5 ${labelColor}`}>{label}</p>
            {content}
        </div>
        <button onClick={onEdit}
            title="修正する"
            className="shrink-0 p-1.5 rounded-lg bg-white/5 hover:bg-white/12 text-gray-500 hover:text-white transition-all">
            <Edit2 size={14} />
        </button>
    </div>
);

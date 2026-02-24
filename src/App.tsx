import { useState } from 'react'
import './App.css'
import { GrowForm } from './components/GrowForm'
import { HistoryList } from './components/HistoryList'
import { useGrowData } from './hooks/useGrowData'
import { Plus, List, Sparkles } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

function App() {
    const { entries, addEntry, updateEntry, deleteEntry } = useGrowData();
    const [view, setView] = useState<'form' | 'history'>('form');

    return (
        <div className="min-h-screen bg-[#0f172a] text-white flex flex-col">
            {/* Fixed Header */}
            <header className="fixed top-0 left-0 right-0 h-16 z-40 flex items-center justify-between px-4 md:px-8 border-b border-white/10"
                style={{ background: 'rgba(15,23,42,0.85)', backdropFilter: 'blur(20px)' }}>
                <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 md:w-9 md:h-9 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
                        <Sparkles size={16} className="md:size-[18px]" />
                    </div>
                    <h1 className="text-lg md:text-xl font-extrabold tracking-tight bg-gradient-to-r from-blue-200 to-white bg-clip-text text-transparent">
                        Grow Steps
                    </h1>
                </div>
                <nav className="flex gap-1">
                    <button
                        onClick={() => setView('form')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${view === 'form' ? 'bg-blue-500/20 text-blue-300 shadow-inner' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
                    >
                        <Plus size={16} /> <span className="hidden sm:inline">新しい記録</span>
                    </button>
                    <button
                        onClick={() => setView('history')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${view === 'history' ? 'bg-purple-500/20 text-purple-300 shadow-inner' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
                    >
                        <List size={16} /> <span className="hidden sm:inline">履歴</span>
                        {entries.length > 0 && (
                            <span className="bg-white/10 text-xs rounded-full px-2 py-0.5 font-bold">
                                {entries.length}
                            </span>
                        )}
                    </button>
                </nav>
            </header>

            {/* Main Content */}
            <main className="flex-1 pt-20 md:pt-24 pb-32 px-4 md:px-8 max-w-4xl mx-auto w-full">
                <AnimatePresence mode="wait">
                    {view === 'form' ? (
                        <motion.div
                            key="form"
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -12 }}
                            transition={{ duration: 0.2 }}
                        >
                            <div className="text-center mb-6">
                                <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-2">最速最小の一歩を。</h2>
                                <p className="text-gray-400 text-sm max-w-md mx-auto">
                                    今日の成長を記録して、明確な行動計画を立てましょう。
                                </p>
                            </div>
                            <GrowForm
                                onAdd={(entry) => {
                                    addEntry(entry);
                                }}
                                onGoToHistory={() => setView('history')}
                            />
                        </motion.div>
                    ) : (
                        <motion.div
                            key="history"
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -12 }}
                            transition={{ duration: 0.2 }}
                        >
                            <HistoryList
                                entries={entries}
                                onUpdate={updateEntry}
                                onDelete={deleteEntry}
                            />
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>

            {/* Footer */}
            <footer className="py-6 text-center text-gray-600 text-xs border-t border-white/5">
                © 2024 Grow Steps — Build Your Momentum
            </footer>
        </div>
    )
}

export default App

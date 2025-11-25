import React, { useState } from 'react';
import { Nebula } from '../Trails/Nebula';
import { OracleWidget } from '../Oracle/OracleWidget';
import { HordeFeed } from '../Horde/HordeFeed';
import { TaskBoard } from './TaskBoard';
import { IntelPanel } from '../Intel/IntelPanel';
import { OperativeSearchPanel } from '../Operative/OperativeSearchPanel';
import { EditIdentityModal } from '../Registry/EditIdentityModal';
import { CreateActionModal } from './CreateActionModal';
import { LayoutGrid, Database, Users, Bell, LogOut, Edit3, Plus } from 'lucide-react';
import clsx from 'clsx';
import { useOrbitStore } from '../../store/useOrbitStore';
import { AnimatePresence, motion } from 'framer-motion';

type ViewState = 'dashboard' | 'intel' | 'registry' | 'notifications';

export const Dashboard: React.FC = () => {
  const [activeView, setActiveView] = useState<ViewState>('dashboard');
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const { currentUser, logout } = useOrbitStore();

  return (
    <div className="relative w-full h-screen flex">
      <Nebula />

      {/* Sidebar */}
      <aside className="w-16 lg:w-20 h-full border-r border-slate-800 bg-slate-950/80 backdrop-blur-md z-20 flex flex-col items-center py-6 gap-6 transition-all">
        <div className="w-10 h-10 rounded-xl bg-violet-600 flex items-center justify-center shadow-[0_0_15px_rgba(124,58,237,0.5)]">
          <LayoutGrid className="text-white w-6 h-6" />
        </div>

        <nav className="flex-1 flex flex-col gap-4 w-full items-center mt-8">
          {/* DEPLOY BUTTON - HIGH CONTRAST */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowCreateModal(true)}
            className="w-12 h-12 mb-6 rounded-xl bg-cyan-500 text-slate-950 shadow-[0_0_20px_rgba(6,182,212,0.6)] flex items-center justify-center relative group"
            title="DEPLOY SYSTEM"
          >
            <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 rounded-xl transition-opacity" />
            <Plus className="w-7 h-7 stroke-[3]" />
            <span className="absolute -bottom-1 w-1 h-1 bg-white rounded-full" />
          </motion.button>

          <button
            onClick={() => setActiveView('dashboard')}
            className={clsx(
              "p-3 rounded-xl border transition-all duration-300",
              activeView === 'dashboard'
                ? "bg-slate-800 text-violet-400 border-slate-700 shadow-lg shadow-violet-900/20"
                : "bg-transparent text-slate-500 border-transparent hover:bg-slate-900 hover:text-slate-300"
            )}
            title="Command Dashboard"
          >
            <LayoutGrid className="w-5 h-5" />
          </button>

          <button
            onClick={() => setActiveView('intel')}
            className={clsx(
              "p-3 rounded-xl border transition-all duration-300",
              activeView === 'intel'
                ? "bg-slate-800 text-cyan-400 border-slate-700 shadow-lg shadow-cyan-900/20"
                : "bg-transparent text-slate-500 border-transparent hover:bg-slate-900 hover:text-slate-300"
            )}
            title="Intel Research"
          >
            <Database className="w-5 h-5" />
          </button>

          <button
            onClick={() => setActiveView('registry')}
            className={clsx(
              "p-3 rounded-xl border transition-all duration-300",
              activeView === 'registry'
                ? "bg-slate-800 text-cyan-400 border-slate-700 shadow-lg shadow-cyan-900/20"
                : "bg-transparent text-slate-500 border-transparent hover:bg-slate-900 hover:text-slate-300"
            )}
            title="Operative Registry"
          >
            <Users className="w-5 h-5" />
          </button>

          <button className="p-3 rounded-xl hover:bg-slate-900 text-slate-500 hover:text-slate-300 transition-colors relative">
            <Bell className="w-5 h-5" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full" />
          </button>
        </nav>

        <div className="flex flex-col items-center gap-4 mb-2">
          <button
            onClick={() => setShowEditModal(true)}
            className="relative group"
            title="Edit Profile"
          >
            <img src={currentUser?.avatar} alt="Me" className="w-8 h-8 rounded-full border border-slate-600 group-hover:border-violet-500 transition-colors" />
            <div className="absolute inset-0 bg-slate-950/80 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Edit3 className="w-4 h-4 text-violet-400" />
            </div>
          </button>
          <button
            onClick={logout}
            className="p-3 text-slate-600 hover:text-red-400 transition-colors"
            title="Logout"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 z-10 flex flex-col h-full overflow-hidden relative">
        {/* Heads Up Display */}
        <header className="h-16 border-b border-slate-800 bg-slate-950/50 backdrop-blur-sm flex items-center justify-between px-6 shrink-0">
          <div className="flex items-center gap-6">
            <div>
              <h1 className="text-lg font-bold text-white tracking-widest">ORBIT OS</h1>
              <p className="text-[10px] text-slate-500 font-mono uppercase">
                OPERATIVE: {currentUser?.username}
              </p>
            </div>
          </div>

          {/* Bell Schedule Widget */}
          <div className="flex items-center gap-4 bg-slate-900/80 px-4 py-2 rounded-full border border-slate-800">
            <span className="text-xs text-slate-400 font-medium">PERIOD 4</span>
            <div className="h-4 w-[1px] bg-slate-700" />
            <span className="text-xs text-violet-400 font-mono font-bold">14:00 REMAINING</span>
          </div>
        </header>

        {/* View Switcher */}
        <div className="flex-1 overflow-hidden relative">
          {activeView === 'dashboard' && (
            <div className="absolute inset-0 p-6 grid grid-cols-12 gap-6 overflow-hidden animate-in fade-in duration-300">
              {/* Left: Tasks (5 cols) */}
              <div className="col-span-5 h-full overflow-hidden">
                <TaskBoard />
              </div>

              {/* Middle: Horde (3 cols) */}
              <div className="col-span-3 h-full overflow-hidden pt-12">
                <HordeFeed />
              </div>

              {/* Right: Oracle (4 cols) */}
              <div className="col-span-4 h-full overflow-hidden">
                <OracleWidget />
              </div>
            </div>
          )}

          {activeView === 'intel' && (
            <div className="absolute inset-0 p-6 overflow-hidden animate-in fade-in duration-300">
              <IntelPanel />
            </div>
          )}

          {activeView === 'registry' && (
            <div className="absolute inset-0 p-6 overflow-hidden animate-in fade-in duration-300">
              <OperativeSearchPanel />
            </div>
          )}
        </div>
      </main>

      {/* Edit Identity Modal */}
      <AnimatePresence>
        {showEditModal && (
          <EditIdentityModal onClose={() => setShowEditModal(false)} />
        )}
      </AnimatePresence>

      {/* Create Action Modal (DEPLOY SYSTEM) */}
      <AnimatePresence>
        {showCreateModal && (
          <CreateActionModal onClose={() => setShowCreateModal(false)} />
        )}
      </AnimatePresence>
    </div>
  );
};
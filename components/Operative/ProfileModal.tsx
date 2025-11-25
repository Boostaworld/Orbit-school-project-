import React from 'react';
import { motion } from 'framer-motion';
import { X, Target, TrendingUp, Calendar, Activity } from 'lucide-react';

interface ProfileModalProps {
  profile: {
    id: string;
    username: string;
    avatar_url: string;
    bio: string;
    tasks_completed: number;
    tasks_forfeited: number;
    status: string;
  };
  onClose: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({ profile, onClose }) => {
  const reliability = profile.tasks_completed > 0
    ? Math.round((profile.tasks_completed / (profile.tasks_completed + profile.tasks_forfeited)) * 100)
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-slate-950/95 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-slate-900 border border-slate-800 rounded-xl shadow-2xl max-w-lg w-full overflow-hidden"
      >
        {/* Header */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-violet-500/10" />
          <div className="relative px-6 py-8 border-b border-slate-800">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-1.5 hover:bg-slate-800 rounded-lg transition-colors text-slate-500 hover:text-slate-300"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-start gap-4">
              <div className="relative">
                <img
                  src={profile.avatar_url}
                  alt={profile.username}
                  className="w-20 h-20 rounded-xl border-2 border-slate-700"
                />
                <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-slate-900 flex items-center justify-center ${
                  profile.status === 'Online' ? 'bg-green-500' :
                  profile.status === 'Focus Mode' ? 'bg-violet-500' : 'bg-slate-600'
                }`}>
                  {profile.status === 'Focus Mode' && (
                    <Activity className="w-3 h-3 text-white" />
                  )}
                </div>
              </div>

              <div className="flex-1">
                <h3 className="font-bold text-xl text-slate-100 tracking-wider mb-1">
                  {profile.username}
                </h3>
                <div className="flex items-center gap-2 mb-3">
                  <span className={`text-xs font-mono uppercase tracking-wider ${
                    profile.status === 'Online' ? 'text-green-400' :
                    profile.status === 'Focus Mode' ? 'text-violet-400' : 'text-slate-500'
                  }`}>
                    {profile.status}
                  </span>
                </div>
                {profile.bio && (
                  <p className="text-sm text-slate-400 leading-relaxed">
                    {profile.bio}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="p-6 grid grid-cols-2 gap-4">
          {/* Tasks Completed */}
          <div className="bg-gradient-to-br from-green-500/10 to-green-500/5 border border-green-500/20 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center">
                <Target className="w-4 h-4 text-green-400" />
              </div>
              <span className="text-xs font-mono text-green-400 uppercase tracking-widest">Completed</span>
            </div>
            <p className="text-3xl font-bold text-green-400 font-mono">
              {profile.tasks_completed}
            </p>
          </div>

          {/* Tasks Forfeited */}
          <div className="bg-gradient-to-br from-red-500/10 to-red-500/5 border border-red-500/20 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-red-500/20 flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-red-400" />
              </div>
              <span className="text-xs font-mono text-red-400 uppercase tracking-widest">Forfeited</span>
            </div>
            <p className="text-3xl font-bold text-red-400 font-mono">
              {profile.tasks_forfeited}
            </p>
          </div>
        </div>

        {/* Reliability Score */}
        <div className="px-6 pb-6">
          <div className="bg-slate-950/60 border border-slate-800 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-mono text-slate-400 uppercase tracking-widest">
                Reliability Index
              </span>
              <span className={`text-2xl font-bold font-mono ${
                reliability >= 80 ? 'text-green-400' :
                reliability >= 50 ? 'text-amber-400' : 'text-red-400'
              }`}>
                {reliability}%
              </span>
            </div>
            <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${reliability}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
                className={`h-full rounded-full ${
                  reliability >= 80 ? 'bg-gradient-to-r from-green-500 to-emerald-500' :
                  reliability >= 50 ? 'bg-gradient-to-r from-amber-500 to-yellow-500' :
                  'bg-gradient-to-r from-red-500 to-orange-500'
                }`}
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-900/40">
          <p className="text-center text-xs text-slate-600 font-mono uppercase tracking-wider">
            Operative ID: <span className="text-slate-500">{profile.id.slice(0, 8)}...</span>
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
};

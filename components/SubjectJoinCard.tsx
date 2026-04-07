import React, { useState } from 'react';
import { JoinSubjectByCodeDto, SubjectDto } from '../types';
import { academicService } from '../services/api';
import { KeyRound, ArrowRight, Loader2, CheckCircle2 } from 'lucide-react';

interface SubjectJoinCardProps {
  onJoined: (subject: SubjectDto) => void;
}

export const SubjectJoinCard: React.FC<SubjectJoinCardProps> = ({ onJoined }) => {
  const [code, setCode] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;
    setIsJoining(true);
    setSuccess(false);

    const payload: JoinSubjectByCodeDto = { code: code.trim() };
    const res = await academicService.joinSubjectByCode(payload);
    if (res.success && res.data) {
      onJoined(res.data);
      setCode('');
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2000);
    } else {
      alert(res.message || 'Failed to join subject');
    }

    setIsJoining(false);
  };

  return (
    <div className="bg-white rounded-3xl p-6 shadow-[0_12px_32px_-20px_rgba(0,0,0,0.25)] border border-stone-100">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-900 flex items-center justify-center">
          <KeyRound size={20} />
        </div>
        <div>
          <h3 className="text-lg font-black text-stone-900">Join Subject</h3>
          <p className="text-sm text-stone-500 font-medium">Enter the code your teacher shared.</p>
        </div>
      </div>

      <form onSubmit={handleJoin} className="flex flex-col sm:flex-row gap-3">
        <input
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="e.g. ABC123"
          className="flex-1 h-12 rounded-2xl border border-stone-200 px-4 text-stone-700 font-semibold tracking-widest uppercase bg-stone-50 focus:ring-2 focus:ring-red-200 outline-none"
        />
        <button
          type="submit"
          disabled={isJoining || !code.trim()}
          className="h-12 px-6 rounded-2xl bg-red-900 text-white font-bold flex items-center justify-center gap-2 hover:bg-red-800 transition-colors disabled:opacity-60"
        >
          {isJoining ? <Loader2 size={18} className="animate-spin" /> : <ArrowRight size={18} />}
          Join
        </button>
      </form>

      {success && (
        <div className="mt-4 flex items-center gap-2 text-sm font-semibold text-emerald-600">
          <CheckCircle2 size={16} />
          Joined successfully
        </div>
      )}
    </div>
  );
};

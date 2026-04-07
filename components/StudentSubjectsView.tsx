import React, { useEffect, useMemo, useState } from 'react';
import { CommunityDto, CommunityType, SubjectDto, UserDto } from '../types';
import { academicService } from '../services/api';
import { BookOpen, ChevronRight } from 'lucide-react';
import { SubjectJoinCard } from './SubjectJoinCard';

interface StudentSubjectsViewProps {
  user: UserDto;
  myCommunities: CommunityDto[];
  onOpenSubject: (subjectId: string) => void;
}

export const StudentSubjectsView: React.FC<StudentSubjectsViewProps> = ({
  user,
  myCommunities,
  onOpenSubject
}) => {
  const [subjects, setSubjects] = useState<SubjectDto[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const subjectIds = useMemo(
    () => myCommunities.filter(c => c.type === CommunityType.Subject && c.subjectId).map(c => c.subjectId as string),
    [myCommunities]
  );

  useEffect(() => {
    const loadSubjects = async () => {
      if (!subjectIds.length) {
        setSubjects([]);
        return;
      }

      setIsLoading(true);
      const results = await Promise.all(subjectIds.map(id => academicService.getSubjectById(id)));
      const list = results
        .filter(r => r.success && r.data)
        .map(r => r.data!) as SubjectDto[];
      setSubjects(list);
      setIsLoading(false);
    };

    loadSubjects();
  }, [subjectIds.join('|')]);

  const handleJoin = (subject: SubjectDto) => {
    if (!subject) return;
    if (subject.id && !subjects.find(s => s.id === subject.id)) {
      setSubjects([subject, ...subjects]);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs font-black text-red-800 uppercase tracking-widest">Student</span>
          <h1 className="text-3xl font-black text-stone-900 tracking-tight">My Subjects</h1>
          <p className="text-stone-500 font-medium">Track your enrolled subjects and upcoming tasks.</p>
        </div>
        <div className="hidden md:flex items-center gap-2 text-sm text-stone-500 font-semibold">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          {user.firstName} {user.lastName}
        </div>
      </div>

      <SubjectJoinCard onJoined={handleJoin} />

      <div>
        <h2 className="text-lg font-black text-stone-900 mb-4">Subjects</h2>

        {isLoading && <div className="text-stone-400 font-medium">Loading subjects...</div>}

        {!isLoading && subjects.length === 0 && (
          <div className="bg-white p-8 rounded-3xl border border-stone-100 text-center text-stone-500 font-semibold">
            You haven't joined any subjects yet. Use a code from your teacher to join.
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {subjects.map(subject => (
            <button
              key={subject.id}
              onClick={() => onOpenSubject(subject.id)}
              className="text-left bg-white rounded-3xl p-6 border border-stone-100 shadow-[0_10px_30px_-18px_rgba(0,0,0,0.2)] hover:-translate-y-1 transition-all"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-stone-100 text-stone-700 flex items-center justify-center">
                    <BookOpen size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-stone-900">{subject.name}</h3>
                    <p className="text-sm text-stone-500 font-semibold">{subject.code}</p>
                  </div>
                </div>
                <ChevronRight size={20} className="text-stone-400" />
              </div>
              {subject.teacherName && (
                <p className="text-xs text-stone-500 mt-4 font-medium">
                  Teacher: <span className="text-stone-700 font-bold">{subject.teacherName}</span>
                </p>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

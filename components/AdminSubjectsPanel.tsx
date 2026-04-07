import React, { useEffect, useMemo, useState } from 'react';
import { CreateSubjectDto, StudentGroupDto, SubjectDto, UserDto, UserRole } from '../types';
import { academicService } from '../services/api';
import { Plus, X, Loader2 } from 'lucide-react';

interface AdminSubjectsPanelProps {
  studentGroups: StudentGroupDto[];
  users: UserDto[];
}

export const AdminSubjectsPanel: React.FC<AdminSubjectsPanelProps> = ({ studentGroups, users }) => {
  const [subjects, setSubjects] = useState<SubjectDto[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState<CreateSubjectDto>({
    name: '',
    code: '',
    description: '',
    studentGroupId: '',
    teacherId: ''
  });

  const teachers = useMemo(() => users.filter(u => u.role === UserRole.TEACHER), [users]);

  useEffect(() => {
    const loadSubjects = async () => {
      const responses = await Promise.all(
        studentGroups.map(g => academicService.getSubjectsByGroup(g.id))
      );
      const list = responses
        .filter(r => r.success && r.data)
        .flatMap(r => r.data as SubjectDto[]);

      setSubjects(list);
    };

    if (studentGroups.length) {
      loadSubjects();
    }
  }, [studentGroups.length]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const payload: CreateSubjectDto = {
      name: form.name,
      code: form.code,
      description: form.description || undefined,
      studentGroupId: form.studentGroupId || null,
      teacherId: form.teacherId
    };
    const res = await academicService.createSubject(payload);
    if (res.success && res.data) {
      setSubjects([res.data, ...subjects]);
      setIsModalOpen(false);
      setForm({ name: '', code: '', description: '', studentGroupId: '', teacherId: '' });
    } else {
      alert(res.message || 'Failed to create subject');
    }
    setIsSubmitting(false);
  };

  return (
    <section className="mt-8">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-lg font-bold text-stone-800">Subjects</h2>
          <p className="text-xs text-stone-500">{subjects.length} total</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-stone-900 text-white rounded-xl text-sm font-bold hover:bg-stone-800 transition-colors"
        >
          <Plus size={16} /> New Subject
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {subjects.map(subject => (
          <div key={subject.id} className="bg-white rounded-2xl p-5 border border-stone-100 shadow-[0_4px_16px_-10px_rgba(0,0,0,0.08)]">
            <h3 className="font-bold text-stone-900">{subject.name}</h3>
            <p className="text-xs text-stone-500 mt-1">Code: {subject.code}</p>
            {subject.teacherName && (
              <p className="text-xs text-stone-500 mt-1">Teacher: {subject.teacherName}</p>
            )}
            {subject.studentGroupName && (
              <p className="text-xs text-stone-500 mt-1">Group: {subject.studentGroupName}</p>
            )}
            {subject.joinCode && (
              <p className="text-xs text-red-800 mt-3 font-bold bg-red-50 inline-block px-2 py-1 rounded-full">
                Join Code: {subject.joinCode}
              </p>
            )}
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 w-full max-w-lg border border-stone-200 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-black text-stone-900">Create Subject</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-stone-400 hover:text-stone-600">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <input
                className="w-full h-11 rounded-2xl border border-stone-200 px-4 font-semibold text-stone-700"
                placeholder="Subject name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
              <input
                className="w-full h-11 rounded-2xl border border-stone-200 px-4 font-semibold text-stone-700"
                placeholder="Subject code"
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value })}
                required
              />
              <input
                className="w-full h-11 rounded-2xl border border-stone-200 px-4 font-semibold text-stone-700"
                placeholder="Description (optional)"
                value={form.description || ''}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
              <select
                className="w-full h-11 rounded-2xl border border-stone-200 px-4 font-semibold text-stone-700"
                value={form.teacherId}
                onChange={(e) => setForm({ ...form, teacherId: e.target.value })}
                required
              >
                <option value="">Select Teacher...</option>
                {teachers.map(t => (
                  <option key={t.id} value={t.id}>{t.firstName} {t.lastName}</option>
                ))}
              </select>
              <select
                className="w-full h-11 rounded-2xl border border-stone-200 px-4 font-semibold text-stone-700"
                value={form.studentGroupId || ''}
                onChange={(e) => setForm({ ...form, studentGroupId: e.target.value })}
              >
                <option value="">No Student Group</option>
                {studentGroups.map(g => (
                  <option key={g.id} value={g.id}>{g.name}</option>
                ))}
              </select>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-11 rounded-2xl bg-red-900 text-white font-bold hover:bg-red-800 transition-colors flex items-center justify-center gap-2"
              >
                {isSubmitting ? <Loader2 className="animate-spin" size={16} /> : null}
                Create Subject
              </button>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};

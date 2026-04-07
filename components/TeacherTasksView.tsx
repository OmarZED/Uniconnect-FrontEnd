import React, { useEffect, useMemo, useState } from 'react';
import { CommunityType, CreateTaskDto, SubmissionDto, SubjectDto, TaskDto, UserDto } from '../types';
import { academicService, communityService, submissionService, taskService } from '../services/api';
import { ClipboardList, PlusCircle, CheckCircle2, PencilLine, Save, XCircle } from 'lucide-react';

interface TeacherTasksViewProps {
  user: UserDto;
}

export const TeacherTasksView: React.FC<TeacherTasksViewProps> = ({ user }) => {
  const [subjects, setSubjects] = useState<SubjectDto[]>([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('');
  const [tasks, setTasks] = useState<TaskDto[]>([]);
  const [submissions, setSubmissions] = useState<SubmissionDto[]>([]);
  const [loadingTasks, setLoadingTasks] = useState(false);
  const [loadingSubs, setLoadingSubs] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState<SubmissionDto | null>(null);
  const [grade, setGrade] = useState<number>(0);
  const [feedback, setFeedback] = useState('');
  const [isGrading, setIsGrading] = useState(false);

  const [form, setForm] = useState<CreateTaskDto>({
    title: '',
    description: '',
    dueDate: new Date().toISOString(),
    maxScore: 100,
    subjectId: ''
  });

  useEffect(() => {
    const loadSubjects = async () => {
      const ownedRes = await communityService.getOwnedCommunities();
      if (ownedRes.success && ownedRes.data) {
        const subjectIds = ownedRes.data
          .filter(c => c.type === CommunityType.Subject && c.subjectId)
          .map(c => c.subjectId as string);

        if (!subjectIds.length) {
          setSubjects([]);
          return;
        }

        const subjectResults = await Promise.all(subjectIds.map(id => academicService.getSubjectById(id)));
        const list = subjectResults.filter(r => r.success && r.data).map(r => r.data!) as SubjectDto[];
        setSubjects(list);
        if (list.length && !selectedSubjectId) {
          setSelectedSubjectId(list[0].id);
        }
      }
    };

    loadSubjects();
  }, []);

  useEffect(() => {
    const loadTasks = async () => {
      if (!selectedSubjectId) {
        setTasks([]);
        return;
      }
      setLoadingTasks(true);
      const res = await taskService.getTasksBySubject(selectedSubjectId);
      if (res.success && res.data) setTasks(res.data);
      setLoadingTasks(false);
    };

    loadTasks();
  }, [selectedSubjectId]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSubjectId) return;
    const payload: CreateTaskDto = { ...form, subjectId: selectedSubjectId };
    const res = await taskService.createTask(payload);
    if (res.success && res.data) {
      setTasks([res.data, ...tasks]);
      setForm({ title: '', description: '', dueDate: new Date().toISOString(), maxScore: 100, subjectId: selectedSubjectId });
    } else {
      alert(res.message || 'Failed to create task');
    }
  };

  const handleLoadSubmissions = async (taskId: string) => {
    setLoadingSubs(true);
    const res = await submissionService.getSubmissionsByTask(taskId);
    if (res.success && res.data) setSubmissions(res.data);
    setSelectedSubmission(null);
    setLoadingSubs(false);
  };

  const openSubmission = (submission: SubmissionDto) => {
    setSelectedSubmission(submission);
    setGrade(submission.grade ?? 0);
    setFeedback(submission.feedback ?? '');
  };

  const handleGrade = async () => {
    if (!selectedSubmission) return;
    setIsGrading(true);
    const res = await submissionService.gradeSubmission(selectedSubmission.id, { grade, feedback });
    if (res.success && res.data) {
      const updated = res.data;
      setSubmissions(submissions.map(s => (s.id === updated.id ? updated : s)));
      setSelectedSubmission(updated);
    } else {
      alert(res.message || 'Failed to grade submission');
    }
    setIsGrading(false);
  };

  const selectedSubjectName = useMemo(
    () => subjects.find(s => s.id === selectedSubjectId)?.name || 'Subject',
    [subjects, selectedSubjectId]
  );

  return (
    <div className="max-w-6xl mx-auto p-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs font-black text-red-800 uppercase tracking-widest">Teacher</span>
          <h1 className="text-3xl font-black text-stone-900 tracking-tight">My Tasks</h1>
          <p className="text-stone-500 font-medium">Create tasks and grade submissions.</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl p-6 border border-stone-100 shadow-[0_12px_30px_-20px_rgba(0,0,0,0.2)]">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-900 flex items-center justify-center">
            <PlusCircle size={22} />
          </div>
          <div>
            <h2 className="text-lg font-black text-stone-900">Create Task</h2>
            <p className="text-sm text-stone-500 font-medium">For {selectedSubjectName}</p>
          </div>
        </div>

        <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            className="h-12 rounded-2xl border border-stone-200 px-4 font-semibold text-stone-700"
            placeholder="Task title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
          <input
            className="h-12 rounded-2xl border border-stone-200 px-4 font-semibold text-stone-700"
            type="datetime-local"
            value={form.dueDate.slice(0, 16)}
            onChange={(e) => setForm({ ...form, dueDate: new Date(e.target.value).toISOString() })}
          />
          <textarea
            className="md:col-span-2 min-h-[100px] rounded-2xl border border-stone-200 px-4 py-3 text-stone-700 font-medium"
            placeholder="Task description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
          <input
            className="h-12 rounded-2xl border border-stone-200 px-4 font-semibold text-stone-700"
            type="number"
            value={form.maxScore}
            onChange={(e) => setForm({ ...form, maxScore: Number(e.target.value) })}
          />
          <select
            className="h-12 rounded-2xl border border-stone-200 px-4 font-semibold text-stone-700"
            value={selectedSubjectId}
            onChange={(e) => setSelectedSubjectId(e.target.value)}
          >
            {subjects.map(subject => (
              <option key={subject.id} value={subject.id}>{subject.name}</option>
            ))}
          </select>
          <button
            type="submit"
            className="md:col-span-2 h-12 rounded-2xl bg-red-900 text-white font-bold hover:bg-red-800 transition-colors"
          >
            Create Task
          </button>
        </form>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-3xl p-6 border border-stone-100">
          <div className="flex items-center gap-3 mb-4">
            <ClipboardList size={20} className="text-stone-500" />
            <h3 className="text-lg font-black text-stone-900">Tasks</h3>
          </div>
          {loadingTasks && <p className="text-stone-400">Loading tasks...</p>}
          {!loadingTasks && tasks.length === 0 && <p className="text-stone-400">No tasks yet.</p>}
          <div className="space-y-3">
            {tasks.map(task => (
              <button
                key={task.id}
                onClick={() => handleLoadSubmissions(task.id)}
                className="w-full text-left p-4 rounded-2xl border border-stone-100 hover:bg-stone-50 transition-colors"
              >
                <h4 className="font-bold text-stone-900">{task.title}</h4>
                <p className="text-xs text-stone-500">Due: {new Date(task.dueDate).toLocaleString()}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-stone-100">
          <div className="flex items-center gap-3 mb-4">
            <CheckCircle2 size={20} className="text-emerald-500" />
            <h3 className="text-lg font-black text-stone-900">Submissions</h3>
          </div>
          {loadingSubs && <p className="text-stone-400">Loading submissions...</p>}
          {!loadingSubs && submissions.length === 0 && <p className="text-stone-400">Select a task to view submissions.</p>}
          <div className="space-y-3">
            {submissions.map(sub => (
              <button
                key={sub.id}
                onClick={() => openSubmission(sub)}
                className="w-full text-left p-4 rounded-2xl border border-stone-100 hover:bg-stone-50 transition-colors"
              >
                <p className="font-bold text-stone-900">{sub.studentName}</p>
                <p className="text-xs text-stone-500">Status: {sub.status}</p>
              </button>
            ))}
          </div>
        </div>
      </div>

      {selectedSubmission && (
        <div className="bg-white rounded-3xl p-6 border border-stone-100">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <PencilLine size={18} className="text-stone-500" />
              <h3 className="text-lg font-black text-stone-900">Grade Submission</h3>
            </div>
            <button onClick={() => setSelectedSubmission(null)} className="text-stone-400 hover:text-stone-600">
              <XCircle size={20} />
            </button>
          </div>

          <div className="bg-stone-50 rounded-2xl p-4 mb-4">
            <p className="text-sm font-semibold text-stone-600">Student</p>
            <p className="text-lg font-black text-stone-900">{selectedSubmission.studentName}</p>
            <p className="text-sm text-stone-500 mt-2">{selectedSubmission.content}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="number"
              className="h-12 rounded-2xl border border-stone-200 px-4 font-semibold text-stone-700"
              value={grade}
              onChange={(e) => setGrade(Number(e.target.value))}
            />
            <input
              type="text"
              className="h-12 rounded-2xl border border-stone-200 px-4 font-semibold text-stone-700"
              placeholder="Feedback"
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
            />
          </div>

          <button
            onClick={handleGrade}
            disabled={isGrading}
            className="mt-4 h-12 px-6 rounded-2xl bg-red-900 text-white font-bold hover:bg-red-800 transition-colors flex items-center gap-2"
          >
            <Save size={18} />
            {isGrading ? 'Saving...' : 'Submit Grade'}
          </button>
        </div>
      )}
    </div>
  );
};

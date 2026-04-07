import React, { useEffect, useState } from 'react';
import { CreateSubmissionDto, SubmissionDto, TaskDto } from '../types';
import { submissionService, taskService } from '../services/api';
import { CheckCircle2, Send, ClipboardList } from 'lucide-react';

interface StudentTasksViewProps {
  subjectId: string;
  subjectName?: string;
}

export const StudentTasksView: React.FC<StudentTasksViewProps> = ({ subjectId, subjectName }) => {
  const [tasks, setTasks] = useState<TaskDto[]>([]);
  const [selectedTask, setSelectedTask] = useState<TaskDto | null>(null);
  const [submissionMap, setSubmissionMap] = useState<Record<string, SubmissionDto>>({});
  const [content, setContent] = useState('');
  const [attachmentUrl, setAttachmentUrl] = useState('');
  const [loadingTasks, setLoadingTasks] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const loadTasks = async () => {
      setLoadingTasks(true);
      const res = await taskService.getTasksBySubject(subjectId);
      if (res.success && res.data) {
        setTasks(res.data);
      }
      setLoadingTasks(false);
    };
    loadTasks();
  }, [subjectId]);

  const openTask = (task: TaskDto) => {
    setSelectedTask(task);
    const existing = submissionMap[task.id];
    setContent(existing?.content || '');
    setAttachmentUrl(existing?.attachmentUrl || '');
  };

  const handleSubmit = async () => {
    if (!selectedTask) return;
    setIsSubmitting(true);
    const payload: CreateSubmissionDto = {
      taskId: selectedTask.id,
      content,
      attachmentUrl: attachmentUrl || undefined
    };
    const res = await submissionService.createSubmission(payload);
    if (res.success && res.data) {
      setSubmissionMap({ ...submissionMap, [selectedTask.id]: res.data });
    } else {
      alert(res.message || 'Submission failed');
    }
    setIsSubmitting(false);
  };

  return (
    <div className="max-w-6xl mx-auto p-8 space-y-6">
      <div>
        <span className="text-xs font-black text-red-800 uppercase tracking-widest">Student</span>
        <h1 className="text-3xl font-black text-stone-900 tracking-tight">Tasks for {subjectName || 'Subject'}</h1>
        <p className="text-stone-500 font-medium">Submit your work and view grades.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-3xl p-6 border border-stone-100">
          <div className="flex items-center gap-3 mb-4">
            <ClipboardList size={20} className="text-stone-500" />
            <h3 className="text-lg font-black text-stone-900">Tasks</h3>
          </div>
          {loadingTasks && <p className="text-stone-400">Loading tasks...</p>}
          {!loadingTasks && tasks.length === 0 && <p className="text-stone-400">No tasks available.</p>}
          <div className="space-y-3">
            {tasks.map(task => (
              <button
                key={task.id}
                onClick={() => openTask(task)}
                className="w-full text-left p-4 rounded-2xl border border-stone-100 hover:bg-stone-50 transition-colors"
              >
                <h4 className="font-bold text-stone-900">{task.title}</h4>
                <p className="text-xs text-stone-500">Due: {new Date(task.dueDate).toLocaleString()}</p>
                {submissionMap[task.id]?.status && (
                  <span className="inline-block mt-2 text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-full">
                    {submissionMap[task.id].status}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-stone-100">
          <div className="flex items-center gap-3 mb-4">
            <CheckCircle2 size={20} className="text-emerald-500" />
            <h3 className="text-lg font-black text-stone-900">Submission</h3>
          </div>
          {!selectedTask && <p className="text-stone-400">Select a task to submit.</p>}
          {selectedTask && (
            <div className="space-y-3">
              <div className="bg-stone-50 rounded-2xl p-4">
                <h4 className="font-bold text-stone-900">{selectedTask.title}</h4>
                <p className="text-xs text-stone-500">Max Score: {selectedTask.maxScore}</p>
              </div>
              <textarea
                className="w-full min-h-[140px] rounded-2xl border border-stone-200 px-4 py-3 text-stone-700 font-medium"
                placeholder="Write your submission..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
              <input
                className="h-12 rounded-2xl border border-stone-200 px-4 font-semibold text-stone-700"
                placeholder="Attachment URL (optional)"
                value={attachmentUrl}
                onChange={(e) => setAttachmentUrl(e.target.value)}
              />
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="h-12 px-6 rounded-2xl bg-red-900 text-white font-bold hover:bg-red-800 transition-colors flex items-center gap-2"
              >
                <Send size={18} />
                {isSubmitting ? 'Submitting...' : 'Submit'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

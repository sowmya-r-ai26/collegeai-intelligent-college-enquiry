import type { Application, ChatMessage, ChatSource, CollegeInfo, Course } from '../types';

const API_BASE = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, '') || '';

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
    ...init,
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const message = (data as { error?: string; detail?: string }).error ||
      (data as { detail?: string }).detail ||
      `Request failed (${res.status})`;
    throw new Error(message);
  }
  return data as T;
}

export const api = {
  getHealth: () => request<{ status: string; courses_count: number; knowledge_chunks_count: number }>('/api/health'),

  getCollegeInfo: () => request<CollegeInfo>('/api/college/info'),

  getCourses: (params?: { category?: string; level?: string }) => {
    const search = new URLSearchParams();
    if (params?.category && params.category !== 'All') search.set('category', params.category);
    if (params?.level && params.level !== 'All') search.set('level', params.level);
    const qs = search.toString();
    return request<{ courses: Course[]; total: number }>(`/api/courses${qs ? `?${qs}` : ''}`);
  },

  searchCourses: (q: string, category?: string, level?: string) => {
    const search = new URLSearchParams();
    if (q.trim()) search.set('q', q.trim());
    if (category && category !== 'All') search.set('category', category);
    if (level && level !== 'All') search.set('level', level);
    return request<{ courses: Course[]; total: number }>(`/api/courses/search?${search.toString()}`);
  },

  getCourseById: (courseId: number) => request<{ course: Course }>(`/api/courses/${courseId}`),

  submitApplication: (payload: {
    full_name: string;
    email: string;
    mobile_number: string;
    date_of_birth: string;
    gender: 'Male' | 'Female' | 'Other';
    address: string;
    selected_course_id: number;
    academic_qualification: string;
    percentage: number;
    tenth_percentage?: number;
    previous_institution?: string;
    quota: string;
  }) =>
    request<{ message: string; application: Application }>('/api/applications', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  trackApplication: (applicationNumber: string, contact: string) => {
    const search = new URLSearchParams({ contact: contact.trim() });
    return request<{ application: Application }>(
      `/api/applications/track/${encodeURIComponent(applicationNumber.trim())}?${search.toString()}`,
    );
  },

  verifyDashboardAccess: (contact: string, applicationNumber?: string) =>
    request<{
      applicant: { full_name: string; email: string; mobile_number: string; is_demo: boolean };
      applications: Application[];
    }>('/api/applications/verify-dashboard', {
      method: 'POST',
      body: JSON.stringify({
        contact: contact.trim(),
        application_number: applicationNumber?.trim() || undefined,
      }),
    }),

  sendChatMessage: (sessionId: string, message: string) =>
    request<{
      session_id: string;
      user_message: string;
      assistant_response: string;
      sources: ChatSource[];
    }>('/api/chat', {
      method: 'POST',
      body: JSON.stringify({ session_id: sessionId, message }),
    }),

  getChatHistory: (sessionId: string) =>
    request<{ session_id: string; messages: ChatMessage[] }>(
      `/api/chat/history/${encodeURIComponent(sessionId)}`,
    ),
};

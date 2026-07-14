import { create } from 'zustand';
import { toast } from 'sonner';
import type {
  SessionListItem,
  SessionDetail,
  GenerateInterviewRequest,
  UserAnswer,
  ScoreResponse,
  InterviewFeedback,
} from '@/types/interview';
import * as interviewApi from '@/lib/api/interviews';

interface FetchOptions {
  force?: boolean;
}

let fetchGeneration = 0;
let fetchSessionsPromise: Promise<void> | null = null;

interface InterviewState {
  sessions: SessionListItem[];
  currentSession: SessionDetail | null;
  currentAnswers: Record<string, string>;
  feedback: InterviewFeedback[] | null;
  overallScore: number | null;
  isLoading: boolean;
  hasFetched: boolean;
  isGenerating: boolean;
  isScoring: boolean;
  error: string | null;

  fetchSessions: (options?: FetchOptions) => Promise<void>;
  fetchSession: (id: string) => Promise<void>;
  generateSession: (params: GenerateInterviewRequest) => Promise<SessionDetail>;
  saveAnswer: (questionId: string, answer: string) => void;
  submitForScoring: () => Promise<void>;
  deleteSession: (id: string) => Promise<void>;
  clearCurrentSession: () => void;
  clearError: () => void;
}

export const useInterviewStore = create<InterviewState>((set, get) => ({
  sessions: [],
  currentSession: null,
  currentAnswers: {},
  feedback: null,
  overallScore: null,
  isLoading: false,
  hasFetched: false,
  isGenerating: false,
  isScoring: false,
  error: null,

  fetchSessions: async (options) => {
    const { force = false } = options ?? {};
    const state = get();
    if (state.isLoading) return fetchSessionsPromise ?? undefined;
    if (state.hasFetched && !force) return;

    const myGeneration = ++fetchGeneration;

    fetchSessionsPromise = (async () => {
      set({ isLoading: true, error: null });
      try {
        const sessions = await interviewApi.fetchSessions();
        if (fetchGeneration !== myGeneration) return;
        set({ sessions, isLoading: false, hasFetched: true });
      } catch (err) {
        if (fetchGeneration !== myGeneration) return;
        set({
          isLoading: false,
          error: err instanceof Error ? err.message : 'Failed to load interview sessions',
        });
      } finally {
        if (fetchGeneration === myGeneration) {
          fetchSessionsPromise = null;
        }
      }
    })();

    return fetchSessionsPromise;
  },

  fetchSession: async (id: string) => {
    set({ isLoading: true, error: null, feedback: null, overallScore: null });
    try {
      const session = await interviewApi.fetchSession(id);
      let answers: Record<string, string> = {};
      if (session.responses) {
        try {
          const parsed = JSON.parse(session.responses) as UserAnswer[];
          for (const a of parsed) {
            answers[a.questionId] = a.answer;
          }
        } catch {
          answers = {};
        }
      }
      set({ currentSession: session, currentAnswers: answers, isLoading: false });
    } catch (err) {
      set({
        isLoading: false,
        error: err instanceof Error ? err.message : 'Failed to load interview session',
      });
    }
  },

  generateSession: async (params: GenerateInterviewRequest) => {
    set({ isGenerating: true, error: null, currentSession: null, feedback: null, overallScore: null, currentAnswers: {} });
    try {
      const session = await interviewApi.generateInterview(params);
      set({ isGenerating: false });
      await get().fetchSessions({ force: true });
      toast.success('Interview session created');
      return session;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Something went wrong');
      set({
        isGenerating: false,
        error: err instanceof Error ? err.message : 'Failed to generate interview',
      });
      throw err;
    }
  },

  saveAnswer: (questionId: string, answer: string) => {
    set((state) => ({
      currentAnswers: { ...state.currentAnswers, [questionId]: answer },
    }));
  },

  submitForScoring: async () => {
    const { currentSession, currentAnswers } = get();
    if (!currentSession) return;

    set({ isScoring: true, error: null, feedback: null, overallScore: null });
    try {
      const answers = Object.entries(currentAnswers).map(([questionId, answer]) => ({
        questionId,
        answer,
      }));
      const result = await interviewApi.scoreInterview(currentSession.id, { answers });
      set({
        feedback: result.feedback,
        overallScore: result.overallScore,
        isScoring: false,
        currentSession: {
          ...currentSession,
          status: 'COMPLETED',
          overallScore: result.overallScore,
          answeredCount: answers.length,
        },
      });
      toast.success('Answers submitted for scoring');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Something went wrong');
      set({
        isScoring: false,
        error: err instanceof Error ? err.message : 'Failed to score interview',
      });
      throw err;
    }
  },

  deleteSession: async (id: string) => {
    set({ error: null });
    try {
      await interviewApi.deleteSession(id);
      set((state) => ({
        sessions: state.sessions.filter((s) => s.id !== id),
        currentSession:
          state.currentSession?.id === id ? null : state.currentSession,
        feedback: state.currentSession?.id === id ? null : state.feedback,
        overallScore: state.currentSession?.id === id ? null : state.overallScore,
      }));
      toast.success('Session deleted');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Something went wrong');
      set({
        error: err instanceof Error ? err.message : 'Failed to delete interview session',
      });
      throw err;
    }
  },

  clearCurrentSession: () => set({ currentSession: null, feedback: null, overallScore: null, currentAnswers: {} }),

  clearError: () => set({ error: null }),
}));

export function resetInterviewStore() {
  fetchGeneration++;
  fetchSessionsPromise = null;
  useInterviewStore.setState({
    sessions: [],
    currentSession: null,
    currentAnswers: {},
    feedback: null,
    overallScore: null,
    isLoading: false,
    hasFetched: false,
    isGenerating: false,
    isScoring: false,
    error: null,
  });
}

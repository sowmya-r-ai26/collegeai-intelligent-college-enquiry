import React, { useEffect, useRef, useState } from 'react';
import {
  AlertCircle,
  BookOpen,
  Bot,
  Loader2,
  Send,
  Sparkles,
  User,
} from 'lucide-react';
import { useCollege } from '../context/CollegeContext';
import { api } from '../services/api';
import type { ChatSource } from '../types';

interface MessageBubble {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  sources?: ChatSource[];
  timestamp?: string;
}

const SUGGESTED_QUESTIONS = [
  'What are the fees and eligibility for B.Sc AI & Data Science?',
  'Tell me about hostel accommodation and annual mess fees.',
  'What scholarships are available for 2026–2027 admissions?',
  'How does the online admission and counseling process work?',
  'What is the placement record and who are the top recruiters?',
];

export function ChatbotPage({
  queuedPrompt,
  onClearQueuedPrompt,
}: {
  queuedPrompt?: string | null;
  onClearQueuedPrompt: () => void;
}) {
  const { chatSessionId, incrementEnquiryCount } = useCollege();
  const [messages, setMessages] = useState<MessageBubble[]>([]);
  const [input, setInput] = useState('');
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let active = true;
    setLoadingHistory(true);
    api
      .getChatHistory(chatSessionId)
      .then((res) => {
        if (!active) return;
        const hydrated: MessageBubble[] = [];
        for (const row of res.messages) {
          hydrated.push({
            id: `u-${row.id}`,
            role: 'user',
            text: row.user_message,
            timestamp: row.created_at,
          });
          hydrated.push({
            id: `a-${row.id}`,
            role: 'assistant',
            text: row.assistant_response,
            sources: row.sources,
            timestamp: row.created_at,
          });
        }
        setMessages(hydrated);
      })
      .catch(() => {
        // Ignore empty initial history error
      })
      .finally(() => {
        if (active) setLoadingHistory(false);
      });

    return () => {
      active = false;
    };
  }, [chatSessionId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, sending]);

  const sendMessage = async (textToSend: string) => {
    const trimmed = textToSend.trim();
    if (!trimmed || sending) return;

    setError(null);
    setInput('');
    const optimisticId = `opt-${Date.now()}`;
    setMessages((prev) => [
      ...prev,
      { id: optimisticId, role: 'user', text: trimmed, timestamp: new Date().toISOString() },
    ]);
    setSending(true);

    try {
      const res = await api.sendChatMessage(chatSessionId, trimmed);
      incrementEnquiryCount();
      setMessages((prev) => [
        ...prev,
        {
          id: `ans-${Date.now()}`,
          role: 'assistant',
          text: res.assistant_response,
          sources: res.sources,
          timestamp: new Date().toISOString(),
        },
      ]);
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to reach CollegeAI Assistant. Please verify your server configuration.',
      );
    } finally {
      setSending(false);
    }
  };

  useEffect(() => {
    if (queuedPrompt && !loadingHistory) {
      const prompt = queuedPrompt;
      onClearQueuedPrompt();
      void sendMessage(prompt);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queuedPrompt, loadingHistory]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void sendMessage(input);
  };

  return (
    <div className="max-w-4xl mx-auto flex flex-col h-[calc(100vh-11.5rem)] md:h-[calc(100vh-11rem)] bg-[#0C1225] border border-slate-800/90 rounded-3xl overflow-hidden">
      {/* Chatbot Header */}
      <div className="px-5 py-4 bg-[#10172E] border-b border-slate-800 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-400 to-indigo-600 flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-display text-base sm:text-lg font-semibold text-white">
              CollegeAI Admissions Assistant
            </h1>
            <p className="text-xs text-slate-400">
              Grounded in verified VETIAS knowledge base · Gemini RAG
            </p>
          </div>
        </div>
        <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[11px] font-medium text-emerald-300">
          Verified Sources Only
        </span>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
        {loadingHistory ? (
          <div className="flex items-center justify-center py-12 text-slate-400 gap-2 text-sm">
            <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
            <span>Loading conversation history...</span>
          </div>
        ) : messages.length === 0 ? (
          <div className="space-y-6 py-4">
            <div className="p-5 rounded-2xl bg-[#111A35] border border-slate-800/90 space-y-2.5">
              <div className="flex items-center gap-2 text-indigo-300 text-sm font-semibold">
                <Bot className="w-4 h-4" />
                <span>Welcome to VET Institute of Arts &amp; Science</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Ask me anything about UG &amp; PG courses, tuition fees, admission eligibility,
                scholarships, hostel accommodation, campus placements, or upcoming events. All
                answers are retrieved strictly from our verified institutional knowledge base.
              </p>
            </div>

            <div className="space-y-2.5">
              <p className="text-xs font-medium text-slate-400">Suggested Enquiries</p>
              <div className="flex flex-wrap gap-2">
                {SUGGESTED_QUESTIONS.map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => void sendMessage(q)}
                    className="px-3.5 py-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-800 hover:border-indigo-500/50 text-xs text-slate-200 text-left transition-colors"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'assistant' && (
                <div className="w-8 h-8 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center shrink-0 mt-1">
                  <Bot className="w-4 h-4 text-indigo-300" />
                </div>
              )}

              <div
                className={`max-w-[85%] sm:max-w-[78%] rounded-2xl px-4 py-3 text-xs sm:text-sm leading-relaxed space-y-3 ${
                  msg.role === 'user'
                    ? 'bg-indigo-600 text-white rounded-br-sm'
                    : 'bg-[#121A34] border border-slate-800 text-slate-200 rounded-bl-sm'
                }`}
              >
                <div className="whitespace-pre-wrap">{msg.text}</div>

                {msg.role === 'assistant' && msg.sources && msg.sources.length > 0 && (
                  <div className="pt-2.5 border-t border-slate-800/80 space-y-1.5">
                    <p className="text-[11px] font-medium text-slate-400 flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5 text-sky-400" />
                      <span>Knowledge Base Sources</span>
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {msg.sources.map((src) => (
                        <span
                          key={src.id}
                          className="text-[11px] px-2.5 py-1 rounded-md bg-slate-900/90 border border-slate-700/80 text-sky-300"
                        >
                          {src.title} ({src.category})
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {msg.role === 'user' && (
                <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center shrink-0 mt-1">
                  <User className="w-4 h-4 text-slate-300" />
                </div>
              )}
            </div>
          ))
        )}

        {sending && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4 text-indigo-300" />
            </div>
            <div className="px-4 py-3 rounded-2xl bg-[#121A34] border border-slate-800 text-xs text-slate-300 flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-sky-400" />
              <span>Retrieving verified VETIAS documents &amp; composing answer...</span>
            </div>
          </div>
        )}

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-500/40 flex items-start gap-2.5 text-xs text-rose-200">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input Form */}
      <form
        onSubmit={handleSubmit}
        className="p-3.5 sm:p-4 bg-[#10172E] border-t border-slate-800 flex items-center gap-2.5"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about courses, fees, eligibility, hostel, or scholarships..."
          disabled={sending}
          className="flex-1 px-4 py-3 rounded-xl bg-[#070B1A] border border-slate-700/80 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={sending || !input.trim()}
          aria-label="Send message"
          className="px-4 sm:px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:hover:bg-indigo-600 text-white text-sm font-semibold inline-flex items-center gap-2 transition-colors min-h-[44px]"
        >
          <Send className="w-4 h-4" />
          <span className="hidden sm:inline">Send</span>
        </button>
      </form>
    </div>
  );
}

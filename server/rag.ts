import { GoogleGenAI, ThinkingLevel } from '@google/genai';
import { db } from './db.ts';
import type { KnowledgeChunkRecord } from './types.ts';

function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    throw new Error(
      'GEMINI_API_KEY is not configured. Please add your Gemini API key in Settings > Secrets.',
    );
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

function cosineSimilarity(a: number[], b: number[]): number {
  if (!a.length || !b.length || a.length !== b.length) return 0;
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

function lexicalScore(query: string, chunk: KnowledgeChunkRecord): number {
  const terms = query
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((t) => t.length > 2);
  if (!terms.length) return 0;

  const text = `${chunk.title} ${chunk.category} ${chunk.content}`.toLowerCase();
  let hits = 0;
  for (const term of terms) {
    if (text.includes(term)) {
      hits += chunk.title.toLowerCase().includes(term) ? 2 : 1;
    }
  }
  return hits / (terms.length * 1.5);
}

let embeddingsSeededPromise: Promise<void> | null = null;

async function ensureKnowledgeEmbeddings(ai: GoogleGenAI): Promise<void> {
  const chunks = db.getKnowledgeChunks();
  const missing = chunks.filter((c) => !c.embedding || c.embedding.length === 0);
  if (missing.length === 0) return;

  if (embeddingsSeededPromise) {
    await embeddingsSeededPromise;
    return;
  }

  embeddingsSeededPromise = (async () => {
    try {
      const result = await ai.models.embedContent({
        model: 'gemini-embedding-2',
        contents: missing.map((c) => `${c.title}\n${c.content}`),
      });
      const vectors = result.embeddings ?? [];
      missing.forEach((chunk, idx) => {
        const vals = vectors[idx]?.values;
        if (vals && vals.length > 0) {
          db.updateKnowledgeEmbedding(chunk.id, vals);
        }
      });
      db.persistAll();
    } catch (err) {
      console.warn('Embedding precompute skipped; using hybrid lexical retrieval fallback:', err);
    } finally {
      embeddingsSeededPromise = null;
    }
  })();

  await embeddingsSeededPromise;
}

export interface RetrievedSource {
  id: number;
  title: string;
  category: string;
  content: string;
  score: number;
}

export async function retrieveRelevantKnowledge(
  question: string,
  topK = 4,
): Promise<RetrievedSource[]> {
  const chunks = db.getKnowledgeChunks();
  let queryVector: number[] | null = null;

  try {
    const ai = getGeminiClient();
    await ensureKnowledgeEmbeddings(ai);
    const embedRes = await ai.models.embedContent({
      model: 'gemini-embedding-2',
      contents: question,
    });
    const vals = embedRes.embeddings?.[0]?.values;
    if (vals && vals.length > 0) {
      queryVector = vals;
    }
  } catch (err) {
    console.warn('Query embedding fallback to lexical search:', err);
  }

  const scored = chunks.map((chunk) => {
    const vecScore =
      queryVector && chunk.embedding && chunk.embedding.length === queryVector.length
        ? cosineSimilarity(queryVector, chunk.embedding)
        : 0;
    const lex = lexicalScore(question, chunk);
    const combined = queryVector ? vecScore * 0.78 + Math.min(lex, 1) * 0.22 : lex;
    return {
      id: chunk.id,
      title: chunk.title,
      category: chunk.category,
      content: chunk.content,
      score: Number(combined.toFixed(4)),
    };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, topK);
}

export async function generateRagChatReply(
  sessionId: string,
  userMessage: string,
): Promise<{
  assistant_response: string;
  sources: Array<{ id: number; title: string; category: string; score: number }>;
}> {
  const ai = getGeminiClient();
  const retrieved = await retrieveRelevantKnowledge(userMessage, 5);
  const history = db.getChatHistory(sessionId).slice(-6);

  const contextBlock = retrieved
    .map(
      (src, index) =>
        `[Source ${index + 1}: ${src.title} (${src.category})]\n${src.content}`,
    )
    .join('\n\n');

  const historyText = history
    .map(
      (h) => `User: ${h.user_message}\nCollegeAI: ${h.assistant_response}`,
    )
    .join('\n\n');

  const systemInstruction = [
    'You are CollegeAI, the official Intelligent College Enquiry & Admission Assistant for VET Institute of Arts & Science (VETIAS), Erode, affiliated with Bharathiar University.',
    'STRICT GROUNDING RULES:',
    '1. Answer ONLY using the verified VETIAS Knowledge Base context provided below.',
    '2. NEVER invent or guess tuition fees, seat counts, eligibility percentages, hostel fees, dates, or placement statistics that are not explicitly stated in the context.',
    '3. If the answer is not available in the provided Knowledge Base context, politely state that the specific detail is not listed in the verified knowledge base and advise the user to contact the VETIAS Admissions Office at admissions@vetias.edu.in or +91-4294-224400.',
    '4. Keep responses concise, structured, accurate, and warm for prospective students and parents. Cite relevant course codes or source titles naturally.',
  ].join('\n');

  const prompt = [
    '--- VERIFIED VETIAS KNOWLEDGE BASE CONTEXT ---',
    contextBlock,
    historyText ? `\n--- RECENT CONVERSATION HISTORY ---\n${historyText}` : '',
    `\n--- CURRENT USER QUESTION ---\n${userMessage}`,
  ]
    .filter(Boolean)
    .join('\n');

  const response = await ai.models.generateContent({
    model: 'gemini-4-hydrogen',
    contents: prompt,
    config: {
      systemInstruction,
      thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
    },
  });

  const assistantResponse =
    response.text?.trim() ||
    'I could not generate a response right now. Please contact VETIAS Admissions at admissions@vetias.edu.in.';

  const sourceSummaries = retrieved
    .filter((s) => s.score > 0.1)
    .slice(0, 3)
    .map(({ id, title, category, score }) => ({ id, title, category, score }));

  db.saveChatMessage({
    session_id: sessionId,
    user_message: userMessage,
    assistant_response: assistantResponse,
    sources: sourceSummaries,
  });

  return {
    assistant_response: assistantResponse,
    sources: sourceSummaries,
  };
}

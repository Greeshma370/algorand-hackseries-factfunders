import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2, Link as LinkIcon, Mic, FileText } from 'lucide-react';
import { GoogleGenerativeAI, GenerativeModel } from "@google/generative-ai";

// --- Types & Interfaces ---
interface Proposal {
  id: string;
  title: string;
  goal: number;
  raised: number;
  status: string;
}

interface ProofSubmission {
  proposalId: string;
  date: string;
  type: string;
  details: string;
  cost?: number;
  proofUrl: string;
}

interface PlatformData {
  proposals: Proposal[];
  proofSubmissions: ProofSubmission[];
}

interface UploadedFileState {
  base64Data: string | null;
  mimeType: string | null;
  fileName: string;
  error?: boolean;
}

interface Source {
  uri: string;
  title: string;
}

interface ChatMessage {
  role: 'user' | 'bot';
  text: string;
  sources: Source[];
  file?: string | null;
}

// --- MOCK DATA ---
const MOCK_PLATFORM_DATA: PlatformData = {
  proposals: [
    { id: 'P001', title: 'Community Garden Revitalization', goal: 5000, raised: 3200, status: 'In Progress' },
    { id: 'P002', title: 'Tech Skills Workshop Series', goal: 2500, raised: 2500, status: 'Completed' },
    { id: 'P003', title: 'Local Art Installation', goal: 10000, raised: 1500, status: 'Funding' },
  ],
  proofSubmissions: [
    { proposalId: 'P001', date: '2025-10-25', type: 'Expense', details: 'Purchased 10 bags of soil and compost.', cost: 300, proofUrl: 'https://placehold.co/150x50/38bdf8/ffffff?text=Soil+Receipt' },
    { proposalId: 'P001', date: '2025-10-26', type: 'Photo Update', details: 'Photo of the garden area cleared and prepped for planting.', proofUrl: 'https://placehold.co/150x50/10b981/ffffff?text=Garden+Photo' },
    { proposalId: 'P001', date: '2025-11-01', type: 'Expense', details: 'Hired local gardener for consultation.', cost: 500, proofUrl: 'https://placehold.co/150x50/38bdf8/ffffff?text=Consult+Invoice' },
    { proposalId: 'P002', date: '2025-11-05', type: 'Completion', details: 'Final report on workshop attendance and success metrics.', proofUrl: 'https://placehold.co/150x50/10b981/ffffff?text=Final+Report' },
  ],
};

// --- API Logic ---
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GOOGLE_API_KEY || "");

const generateContent = async (
  userQuery: string,
  platformData: PlatformData,
  uploadedFile: UploadedFileState | null
): Promise<{ text: string; sources: Source[] }> => {
  try {
    const model: GenerativeModel = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      systemInstruction: `You are an expert financial and project analyst providing real-time, data-backed insights.
      - Analyze the user's query and the provided 'platformData' context.
      - If an image/file is included, analyze its relevance to the project data.
      - Keep the response professional, concise, and helpful.

      --- CONTEXT ---
      Proposals: ${JSON.stringify(platformData.proposals, null, 2)}
      Submissions: ${JSON.stringify(platformData.proofSubmissions, null, 2)}`
    });

    const promptParts: (string | { inlineData: { data: string; mimeType: string } })[] = [userQuery];

    if (uploadedFile && uploadedFile.base64Data && uploadedFile.mimeType) {
      promptParts.push({
        inlineData: {
          data: uploadedFile.base64Data,
          mimeType: uploadedFile.mimeType,
        },
      });
    }

    const result = await model.generateContent(promptParts);
    const response = await result.response;
    const text = response.text();

    // Safe extraction of sources
    let sources: Source[] = [];
    if (response.candidates && response.candidates[0].groundingMetadata?.groundingAttributions) {
       sources = response.candidates[0].groundingMetadata.groundingAttributions
        .map(attr => ({
            uri: attr.web?.uri || "",
            title: attr.web?.title || "Source"
        }))
        .filter(s => s.uri !== "");
    }

    return { text, sources };

  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Failed to connect to Gemini. Please check your API key and internet connection.");
  }
};

// --- Component ---
const App: React.FC = () => {
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([
    {
      role: 'bot',
      text: "Hi there! I'm ready to analyze your project data. Ask me about a proposal!",
      sources: []
    }
  ]);
  const [input, setInput] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [uploadedFile, setUploadedFile] = useState<UploadedFileState | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null); // Type as any for browser compatibility
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Browser Speech Check
  const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
  const isSpeechSupported = !!SpeechRecognition;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      console.error("File is too large (max 5MB).");
      setUploadedFile({ fileName: "File too large (Max 5MB)", base64Data: null, mimeType: null, error: true });
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        const base64String = reader.result.split(',')[1];
        setUploadedFile({
          base64Data: base64String,
          mimeType: file.type,
          fileName: file.name,
        });
      }
    };
    reader.readAsDataURL(file);
    event.target.value = ''; // Reset input
  };

  const handleVoiceInput = useCallback(() => {
    if (!isSpeechSupported) return;

    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
    } else {
      const recognition = new SpeechRecognition();
      recognition.interimResults = false;
      recognition.lang = 'en-US';
      recognitionRef.current = recognition;

      recognition.onstart = () => { setIsRecording(true); };
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
      };
      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsRecording(false);
      };
      recognition.onend = () => { setIsRecording(false); };
      recognition.start();
    }
  }, [isRecording, isSpeechSupported]);

  const handleSendMessage = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading || isRecording) return;

    const userQuery = input.trim();
    const currentFile = uploadedFile; // Capture current file state

    // 1. Add user message
    setChatHistory(prev => [...prev, {
      role: 'user',
      text: userQuery,
      sources: [],
      file: currentFile?.fileName || null
    }]);

    setInput('');
    setLoading(true);
    setUploadedFile(null); // Clear file immediately after sending

    try {
      const { text, sources } = await generateContent(userQuery, MOCK_PLATFORM_DATA, currentFile);
      setChatHistory(prev => [...prev, { role: 'bot', text, sources }]);
    } catch (error: any) {
      setChatHistory(prev => [...prev, {
        role: 'bot',
        text: `Error: ${error.message || "Something went wrong."}`,
        sources: []
      }]);
    } finally {
      setLoading(false);
    }
  }, [input, loading, isRecording, uploadedFile]);

  // --- Render Helper ---
  const MessageBubble = ({ message }: { message: ChatMessage }) => {
    const isUser = message.role === 'user';
    const bgColor = isUser ? 'bg-indigo-600/10 text-indigo-800' : 'bg-white shadow-md text-gray-800';
    const align = isUser ? 'self-end' : 'self-start';
    const icon = isUser ? <User className="w-5 h-5 text-indigo-600" /> : <Bot className="w-5 h-5 text-gray-600" />;

    return (
      <div className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'} my-2`}>
        <div className={`flex items-start max-w-[85%] p-4 rounded-xl ${bgColor} ${align} border border-gray-100`}>
          <div className="mr-3 mt-1 flex-shrink-0">{icon}</div>
          <div className="flex flex-col overflow-hidden">
            <p className={`whitespace-pre-wrap text-sm ${isUser ? 'text-indigo-800' : 'text-gray-800'}`}>
              {message.text}
            </p>
            {message.file && isUser && (
              <div className="mt-2 text-xs text-gray-500 flex items-center pt-2 border-t border-dashed border-gray-300">
                <FileText className="w-3 h-3 mr-1 text-indigo-500" />
                <span className="font-semibold">Attached:</span>&nbsp;{message.file}
              </div>
            )}
            {message.sources && message.sources.length > 0 && (
              <div className="mt-2 text-xs text-gray-500 border-t border-gray-200 pt-2">
                <p className="font-semibold mb-1">Sources:</p>
                {message.sources.slice(0, 3).map((source, index) => (
                  <a key={index} href={source.uri} target="_blank" rel="noopener noreferrer" className="flex items-center hover:underline text-blue-600 mt-0.5 truncate">
                    <LinkIcon className="w-3 h-3 mr-1 flex-shrink-0" />
                    {source.title}
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-8 font-sans flex justify-center">
      <div className="w-full max-w-3xl bg-gray-100 rounded-2xl shadow-2xl flex flex-col overflow-hidden h-[80vh]">
        {/* Header */}
        <div className="p-4 bg-white border-b border-gray-200 flex items-center">
          <h1 className="text-xl font-bold text-indigo-700 flex items-center">
            <Bot className="w-6 h-6 mr-2" /> Fact Funders Assistant
          </h1>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {chatHistory.map((msg, index) => (
            <MessageBubble key={index} message={msg} />
          ))}
          {loading && (
            <div className="flex justify-start my-2">
              <div className="bg-white p-3 rounded-xl shadow-md text-gray-600 flex items-center">
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Analyzing...
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-gray-200">
          {uploadedFile && uploadedFile.fileName && (
            <div className={`mb-3 text-sm flex items-center p-2 rounded-lg border ${uploadedFile.error ? 'bg-red-50 border-red-200 text-red-600' : 'bg-indigo-50 border-indigo-200 text-gray-600'}`}>
              <FileText className="w-4 h-4 mr-2" />
              <span className="font-medium">{uploadedFile.error ? 'Error:' : 'Attached:'}</span>
              <span className="ml-1 truncate max-w-[200px]">{uploadedFile.fileName}</span>
              <button type="button" onClick={() => setUploadedFile(null)} className="ml-auto text-gray-500 hover:text-gray-700">
                &times;
              </button>
            </div>
          )}

          <div className="flex items-center space-x-3">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept="image/*,application/pdf"
              className="hidden"
              disabled={loading}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={loading}
              className="p-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition duration-150 shadow-md flex items-center justify-center disabled:opacity-50"
            >
              <FileText className="w-5 h-5" />
            </button>

            {isSpeechSupported && (
              <button
                type="button"
                onClick={handleVoiceInput}
                disabled={loading}
                className={`p-3 rounded-lg transition duration-150 shadow-md flex items-center justify-center ${
                  isRecording
                    ? 'bg-red-500 text-white hover:bg-red-600'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                } disabled:opacity-50`}
              >
                <Mic className="w-5 h-5" />
              </button>
            )}

            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask for analysis or attach proof..."
              className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 text-gray-800"
              disabled={loading || isRecording}
            />

            <button
              type="submit"
              disabled={!input.trim() || loading || isRecording}
              className="p-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition duration-150 disabled:bg-indigo-400 shadow-md flex items-center justify-center"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default App;

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2, Link as LinkIcon, Mic, FileText, X, MessageCircle } from 'lucide-react';
import { GoogleGenerativeAI, GenerativeModel } from "@google/generative-ai";

// --- Types ---
interface Source { uri: string; title: string; }
interface ChatMessage { role: 'user' | 'bot'; text: string; sources: Source[]; file?: string | null; }
interface UploadedFileState { base64Data: string | null; mimeType: string | null; fileName: string; error?: boolean; }

// --- Mock Data ---
const MOCK_PLATFORM_DATA = {
  proposals: [
    { id: 'P001', title: 'Community Garden Revitalization', goal: 5000, raised: 3200, status: 'In Progress' },
    { id: 'P002', title: 'Tech Skills Workshop Series', goal: 2500, raised: 2500, status: 'Completed' },
    { id: 'P003', title: 'Local Art Installation', goal: 10000, raised: 1500, status: 'Funding' },
  ],
  proofSubmissions: [
    { proposalId: 'P001', date: '2025-10-25', type: 'Expense', details: 'Purchased 10 bags of soil and compost.', cost: 300, proofUrl: 'https://placehold.co/150x50/38bdf8/ffffff?text=Soil+Receipt' },
    { proposalId: 'P001', date: '2025-10-26', type: 'Photo Update', details: 'Photo of the garden area cleared and prepped for planting.', proofUrl: 'https://placehold.co/150x50/10b981/ffffff?text=Garden+Photo' },
  ],
};

// --- API Logic ---
const generateContent = async (userQuery: string, uploadedFile: UploadedFileState | null) => {
  const apiKey = import.meta.env.VITE_GOOGLE_API_KEY;

  if (!apiKey) {
    throw new Error("API Key is missing. Check your .env file.");
  }

  const genAI = new GoogleGenerativeAI(apiKey);

  try {
    // ✅ UPDATED MODEL — you have this model in your list
    const model: GenerativeModel = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      systemInstruction: `You are an expert financial and project analyst for Fact Funders.
      Analyze the user's query and the provided platform data. Keep responses concise (under 3 sentences where possible) for a chat widget format.`
    });

    const promptParts: (string | { inlineData: { data: string; mimeType: string } })[] = [
      `Context: ${JSON.stringify(MOCK_PLATFORM_DATA, null, 2)} \n\n User Query: ${userQuery}`
    ];

    if (uploadedFile?.base64Data && uploadedFile?.mimeType) {
      promptParts.push({
        inlineData: { data: uploadedFile.base64Data, mimeType: uploadedFile.mimeType },
      });
    }

    const result = await model.generateContent(promptParts);
    const response = await result.response;
    return { text: response.text(), sources: [] };

  } catch (error: any) {
    console.error("Gemini API Error:", error);

    if (error.message?.includes("404") || error.message?.includes("not found")) {
      throw new Error("Model not found. Please check your API availability.");
    }

    throw new Error("Failed to connect to Fact Funders AI.");
  }
};

const ChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([
    { role: 'bot', text: "Hi! I'm the Fact Funders AI. Ask me about any proposal!", sources: [] }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<UploadedFileState | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory, isOpen]);

  const handleSendMessage = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userQuery = input.trim();
    const currentFile = uploadedFile;

    setChatHistory(prev => [...prev, { role: 'user', text: userQuery, sources: [], file: currentFile?.fileName }]);
    setInput('');
    setLoading(true);
    setUploadedFile(null);

    try {
      const { text, sources } = await generateContent(userQuery, currentFile);
      setChatHistory(prev => [...prev, { role: 'bot', text, sources }]);
    } catch (error: any) {
      setChatHistory(prev => [...prev, { role: 'bot', text: `Error: ${error.message}`, sources: [] }]);
    } finally {
      setLoading(false);
    }
  }, [input, loading, uploadedFile]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          const result = reader.result;
          const base64Data = result.includes(',') ? result.split(',')[1] : result;

          setUploadedFile({
            base64Data,
            mimeType: file.type,
            fileName: file.name
          });
        }
      };
      reader.readAsDataURL(file);
    }
    e.target.value = '';
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {isOpen && (
        <div className="mb-4 w-80 sm:w-96 h-[500px] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-200 transition-all duration-300 ease-in-out transform origin-bottom-right">

          {/* Header */}
          <div className="bg-indigo-700 p-4 text-white flex justify-between items-center shadow-sm">
            <div className="flex items-center">
              <Bot className="w-5 h-5 mr-2" />
              <h3 className="font-semibold text-sm">Fact Funders Assistant</h3>
            </div>
            <button onClick={() => setIsOpen(false)} className="hover:bg-indigo-600 rounded-full p-1">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {chatHistory.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-3 rounded-xl text-sm ${
                  msg.role === 'user' ? 'bg-indigo-600 text-white' : 'bg-white shadow text-gray-800 border border-gray-100'
                }`}>
                  <p className="whitespace-pre-wrap">{msg.text}</p>
                  {msg.file && (
                    <div className="mt-2 text-xs opacity-75 flex items-center pt-1 border-t border-white/20">
                      <FileText className="w-3 h-3 mr-1" /> {msg.file}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="bg-white p-3 rounded-xl shadow border border-gray-100 flex items-center">
                  <Loader2 className="w-4 h-4 text-indigo-600 animate-spin mr-2" />
                  <span className="text-xs text-gray-500">Thinking...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-gray-100 flex items-center space-x-2">
            <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept="image/*" />

            <button type="button" onClick={() => fileInputRef.current?.click()} className={`p-2 rounded-full hover:bg-gray-100 ${uploadedFile ? 'text-indigo-600' : 'text-gray-400'}`}>
              <FileText className="w-5 h-5" />
            </button>

            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 bg-gray-100 border-0 rounded-full px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
            />

            <button type="submit" disabled={!input.trim() || loading} className="p-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 disabled:opacity-50">
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}

      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="h-14 w-14 rounded-full bg-indigo-600 text-white shadow-lg hover:bg-indigo-700 flex items-center justify-center transition-transform hover:scale-105"
        aria-label="Toggle Chat"
      >
        {isOpen ? <X className="w-8 h-8" /> : <MessageCircle className="w-8 h-8" />}
      </button>
    </div>
  );
};

export default ChatWidget;



import React, { useState, useCallback, useRef } from 'react';
import { Send, Bot, User, Loader2, Link as LinkIcon, Mic, FileText } from 'lucide-react';

// --- MOCK CROWDFUNDING PLATFORM DATA ---
// In a real application, this data would be fetched from Firestore/your backend.
const MOCK_PLATFORM_DATA = {
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

// --- API Configuration ---
const apiKey = "";
const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;

// Function to call the Gemini API with exponential backoff
const generateContent = async (userQuery, platformData, uploadedFile) => {
  const systemPrompt = `You are an expert financial and project analyst providing real-time, data-backed insights. Your primary function is to analyze crowdfunding project data, proof submissions, and any submitted media (if provided) to inform donor decisions.
- If the user's query is a simple greeting (e.g., 'Hi', 'Hello', 'What's up'), respond only with a brief, friendly greeting (e.g., 'Hello!', 'Hi there!'). Do not provide a long introduction or data summary.
- Otherwise, analyze the user's query, the provided 'platformData' context, and the attached file (if present).
- If an image/file is included, analyze its relevance to the project data.
- Provide a clear, actionable analysis of the project's progress relative to its goals.
- Offer specific, constructive suggestions or answers to the user based on the analysis.
- Use the Google Search tool for any external, real-time context if necessary.
- Keep the response professional, concise, and focused on the user's query.

--- CONTEXT (Platform Data) ---
Proposals: ${JSON.stringify(platformData.proposals, null, 2)}
Submissions: ${JSON.stringify(platformData.proofSubmissions, null, 2)}
`;

  // Construct the contents array for multimodal input
  const contentsParts = [{ text: userQuery }];
  if (uploadedFile) {
    contentsParts.push({
      inlineData: {
        mimeType: uploadedFile.mimeType,
        data: uploadedFile.base64Data,
      },
    });
  }

  const payload = {
    contents: [{ parts: contentsParts }],
    tools: [{ "google_search": {} }],
    systemInstruction: { parts: [{ text: systemPrompt }] },
  };

  let response;
  let delay = 1000;
  const maxRetries = 3;

  for (let i = 0; i < maxRetries; i++) {
    try {
      response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        break; // Success
      } else if (response.status === 429) {
        console.warn(`Rate limit hit. Retrying in ${delay / 1000}s...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        delay *= 2; // Exponential backoff
      } else {
        const errorBody = await response.json();
        throw new Error(`API Error: ${response.status} - ${errorBody.error.message}`);
      }
    } catch (error) {
      if (i === maxRetries - 1) {
        console.error("Failed to fetch content after retries:", error);
        throw new Error("Could not connect to the analysis engine. Please try again later.");
      }
      await new Promise(resolve => setTimeout(resolve, delay));
      delay *= 2; // Exponential backoff
    }
  }

  const result = await response.json();
  const candidate = result.candidates?.[0];

  if (!candidate || !candidate.content?.parts?.[0]?.text) {
    throw new Error("Received an empty or malformed response from the model.");
  }

  const text = candidate.content.parts[0].text;
  let sources = [];

  const groundingMetadata = candidate.groundingMetadata;
  if (groundingMetadata && groundingMetadata.groundingAttributions) {
    sources = groundingMetadata.groundingAttributions
      .map(attribution => ({
        uri: attribution.web?.uri,
        title: attribution.web?.title,
      }))
      .filter(source => source.uri && source.title);
  }

  return { text, sources };
};

// --- React Component ---
const App = () => {
  const [chatHistory, setChatHistory] = useState([
    {
      role: 'bot',
      text: "Hi there! I'm ready to analyze your project data and proof submissions. Ask me about a specific proposal, like 'Is P001 on budget?'",
      sources: []
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null); // { base64Data, mimeType, fileName }

  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);
  const fileInputRef = useRef(null);

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const isSpeechSupported = !!SpeechRecognition;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  React.useEffect(scrollToBottom, [chatHistory]);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Use a simple limit (5MB) for image/document uploads
    if (file.size > 5 * 1024 * 1024) {
      // Using console.error instead of alert due to iframe constraints
      console.error("File is too large (max 5MB).");
      setUploadedFile({ fileName: "File too large (Max 5MB)", base64Data: null, mimeType: null, error: true });
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      // Extract base64 part
      const base64String = reader.result.split(',')[1];
      setUploadedFile({
        base64Data: base64String,
        mimeType: file.type,
        fileName: file.name,
      });
    };
    reader.readAsDataURL(file);
    // Clear the file input value so the same file can be uploaded again
    event.target.value = null;
  };

  const handleVoiceInput = useCallback(() => {
    if (!isSpeechSupported) {
      console.error("Speech recognition is not supported in this browser.");
      return;
    }

    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
    } else {
      const recognition = new SpeechRecognition();
      recognition.interimResults = false;
      recognition.lang = 'en-US';
      recognitionRef.current = recognition;

      recognition.onstart = () => { setIsRecording(true); };
      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
      };
      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsRecording(false);
      };
      recognition.onend = () => { setIsRecording(false); };
      recognition.start();
    }
  }, [isRecording, isSpeechSupported]);


  const handleSendMessage = useCallback(async (e) => {
    e.preventDefault();
    if (!input.trim() || loading || isRecording) return;

    const userQuery = input.trim();

    // 1. Add user message to history
    setChatHistory(prev => [...prev, { role: 'user', text: userQuery, sources: [], file: uploadedFile ? uploadedFile.fileName : null }]);
    setInput('');
    setLoading(true);

    try {
      // 2. Call the AI analysis function, passing the file
      const { text, sources } = await generateContent(userQuery, MOCK_PLATFORM_DATA, uploadedFile);

      // 3. Add bot response to history
      setChatHistory(prev => [...prev, { role: 'bot', text, sources }]);

    } catch (error) {
      console.error("Chatbot failed:", error.message);
      setChatHistory(prev => [...prev, {
        role: 'bot',
        text: `Error: ${error.message} (Check console for details on API configuration or errors.)`,
        sources: []
      }]);
    } finally {
      setLoading(false);
      setUploadedFile(null); // Clear the uploaded file after sending
    }
  }, [input, loading, isRecording, uploadedFile]);

  // UI Components
  const MessageBubble = ({ message }) => {
    const isUser = message.role === 'user';
    const bgColor = isUser ? 'bg-indigo-600/10 text-indigo-800' : 'bg-white shadow-md text-gray-800';
    const align = isUser ? 'self-end' : 'self-start';
    const icon = isUser ? <User className="w-5 h-5 text-indigo-600" /> : <Bot className="w-5 h-5 text-gray-600" />;

    return (
      <div className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'} my-2`}>
        <div className={`flex items-start max-w-3/4 p-4 rounded-xl ${bgColor} ${align} border border-gray-100`}>
          <div className="mr-3 mt-1 flex-shrink-0">{icon}</div>
          <div className="flex flex-col">
            <p className={`whitespace-pre-wrap text-sm ${isUser ? 'text-indigo-800' : 'text-gray-800'}`}>
              {message.text}
            </p>
            {message.file && isUser && (
              <div className="mt-2 text-xs text-gray-500 flex items-center pt-2 border-t border-dashed">
                <FileText className="w-3 h-3 mr-1 text-indigo-500" />
                <span className="font-semibold">Attached File:</span> {message.file}
              </div>
            )}
            {message.sources && message.sources.length > 0 && (
              <div className="mt-2 text-xs text-gray-500 border-t pt-2">
                <p className="font-semibold mb-1">Sources/Grounding:</p>
                {message.sources.slice(0, 3).map((source, index) => (
                  <a key={index} href={source.uri} target="_blank" rel="noopener noreferrer" className="flex items-center hover:underline text-blue-600 mt-0.5">
                    <LinkIcon className="w-3 h-3 mr-1 flex-shrink-0" />
                    {source.title.substring(0, 50)}...
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
      <script src="https://cdn.tailwindcss.com"></script>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');
        .font-sans { font-family: 'Inter', sans-serif; }
        .chat-messages::-webkit-scrollbar { width: 6px; }
        .chat-messages::-webkit-scrollbar-thumb { background-color: #cbd5e1; border-radius: 3px; }
        .chat-messages::-webkit-scrollbar-track { background-color: #f1f5f9; }
      `}</style>

      <div className="w-full max-w-3xl bg-gray-100 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 bg-white border-b border-gray-200 flex items-center">
          <h1 className="text-xl font-bold text-indigo-700 flex items-center">
            <Bot className="w-6 h-6 mr-2" /> Fact Funders Smart Assistant
          </h1>
        </div>

        {/* Message Area */}
        <div className="flex-1 overflow-y-auto p-4 chat-messages space-y-4">
          {chatHistory.map((msg, index) => (
            <MessageBubble key={index} message={msg} />
          ))}
          {/* Loading indicator */}
          {loading && (
            <div className="flex justify-start my-2">
              <div className="bg-white p-3 rounded-xl shadow-md text-gray-600 flex items-center">
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Analyzing data...
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-gray-200">
          {/* File Preview/Indicator */}
          {uploadedFile && uploadedFile.fileName && (
            <div className={`mb-3 text-sm flex items-center p-2 rounded-lg border ${uploadedFile.error ? 'bg-red-50 border-red-200 text-red-600' : 'bg-indigo-50 border-indigo-200 text-gray-600'}`}>
              <FileText className="w-4 h-4 mr-2" />
              <span className="font-medium">{uploadedFile.error ? 'Error:' : 'Attached:'}</span>
              <span className="ml-1">{uploadedFile.fileName}</span>
              <button type="button" onClick={() => setUploadedFile(null)} className="ml-auto text-gray-500 hover:text-gray-700">
                &times;
              </button>
            </div>
          )}

          <div className="flex items-center space-x-3">

            {/* Hidden File Input */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept="image/*,application/pdf,text/*"
              className="hidden"
              disabled={loading}
            />
            {/* File Upload Button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={loading}
              className="p-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition duration-150 shadow-md flex items-center justify-center disabled:opacity-50"
              aria-label="Upload file for analysis"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-upload"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>
            </button>

            {/* Voice Input Button */}
            {isSpeechSupported && (
              <button
                type="button"
                onClick={handleVoiceInput}
                disabled={loading}
                className={`p-3 rounded-lg transition duration-150 shadow-md flex items-center justify-center ${
                  isRecording
                    ? 'bg-red-500 text-white hover:bg-red-600'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
                aria-label={isRecording ? "Stop voice input" : "Start voice input"}
              >
                <Mic className="w-5 h-5" />
              </button>
            )}

            {/* Text Input - Disabled while recording */}
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask for analysis or attach proof..."
              className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 text-gray-800"
              disabled={loading || isRecording}
            />

            {/* Send Button */}
            <button
              type="submit"
              disabled={!input.trim() || loading || isRecording}
              className="p-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition duration-150 disabled:bg-indigo-400 disabled:cursor-not-allowed shadow-md flex items-center justify-center"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default App;

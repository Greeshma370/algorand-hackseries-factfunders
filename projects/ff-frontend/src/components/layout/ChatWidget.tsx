import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2, Link as LinkIcon, Mic, FileText, X, MessageCircle } from 'lucide-react';
import { GoogleGenerativeAI, GenerativeModel } from "@google/generative-ai";

// --- Types ---
interface Source { uri: string; title: string; }
interface ChatMessage { role: 'user' | 'bot'; text: string; sources: Source[]; file?: string | null; }
interface UploadedFileState { base64Data: string | null; mimeType: string | null; fileName: string; error?: boolean; }

// --- Product / Platform Knowledge ---
// This is what makes the model "know" your site, workflows, and features.
const PLATFORM_KNOWLEDGE = `
You are the in-app assistant for the Fact Funders platform.

High-level product:
- Fact Funders is a decentralized platform for:
  1) Crowdfunding with milestone-based payouts and quadratic donor voting.
  2) Future Self funding: time-locked savings/contracts.
- The site has separate experiences for:
  - Project creators (launch and manage crowdfunding campaigns).
  - Donors/backers (discover projects, donate, vote, and track impact).
  - Users who lock funds for their "future self".
- There is also an integrated Tinyman DEX swap widget so users can swap tokens without leaving the app.

--------------------------------
CROWDFUNDING WORKFLOW (ON-CHAIN CONTRACT)
--------------------------------
Step 1: Project Creation (create_proposal)
- Actor: Project creator.
- UI: Creator dashboard → "Create Proposal" / "New Campaign" type action.
- Requirements:
  - Creator pays a 2 Algo fee to initialize the proposal.
  - Creator defines between 1 and 5 milestones.
  - The sum of all milestone amounts must equal the overall funding goal.
- Contract method: create_proposal.

Step 2: Donation (donate_proposal)
- Actor: Donor/backer.
- UI: Crowdfunding page → choose a project → "Donate" or "Contribute" button.
- Behavior:
  - Donor sends funds to the contract address.
  - Donations are tracked and later used to compute voting weight for milestones.
- Contract method: donate_proposal.

Step 3: Proof Submission (submit_proof)
- Actor: Project creator.
- UI: Creator dashboard → specific project → current milestone → "Submit Proof" or "Upload Update".
- Requirements:
  - Only callable by the project creator.
  - The fundraising goal for the project must have been reached.
- Behavior:
  - Creator submits a link or attachment that proves milestone completion (e.g., receipts, photos, reports).
  - A voting window (e.g., 48 hours) is opened for donors to review and vote.
- Contract method: submit_proof.

Step 4: Donor Voting (vote_milestone)
- Actor: Donor/backer (not the creator).
- UI: Donor dashboard or project detail → "Review Milestone" → buttons like "Approve" / "Reject".
- Requirements:
  - Donor must have contributed at least 1 Algo to that project.
  - Donor cannot be the project creator.
- Behavior:
  - Voting weight uses a Quadratic Voting formula based on the donor’s contribution.
  - Donors vote For or Against the milestone proof.
- Contract method: vote_milestone.

Step 5: Milestone Payout (claim_milestone)
- Actor: Project creator.
- UI: Creator dashboard → project → milestone card → "Claim Payout" button.
- Requirements:
  - The voting period for the milestone must be over.
  - Total "Votes For" > total "Votes Against".
- Behavior:
  - Contract triggers an internal transaction to pay the creator the amount associated with that milestone.
- Contract method: claim_milestone.

Step 6: Proportional Refund (refund_if_inactive)
- Actor: Donor/backer.
- UI: Donor dashboard → project → "Request Refund" or "Claim Refund" option if inactive.
- Requirements:
  - Time since proof submission exceeds the configured inactivity expiration time.
- Behavior:
  - If the project becomes inactive, donors can claim a refund.
  - Refund amount is calculated proportionally based on:
    - Required funding amount vs. amount actually raised.
- Contract method: refund_if_inactive.

--------------------------------
FUTURE SELF FUNDING WORKFLOW (ON-CHAIN CONTRACT)
--------------------------------
Goal: Let a user "pay their future self" by locking funds until an unlock time, with backup addresses.

Step 1: Fund Deposit (fund_future_self)
- Actor: Any user.
- UI: "Future Self" tab or section → "Create New Lock" / "Fund Future Self".
- Requirements:
  - Payment must be a positive amount to the contract.
  - User sets:
    - primary_recipient (typically their own address),
    - backup_recipient (fallback address),
    - unlock_time (timestamp after which funds can be claimed).
- Behavior:
  - Contract stores deposit plus metadata (primary, backup, unlock_time).
- Contract method: fund_future_self.

Step 2: Claim (claim_future_self)
- Actor: Primary or backup recipient.
- UI: Future Self dashboard → list of locks → "Claim" button for eligible ones.
- Requirements:
  - Current timestamp >= unlock_time.
- Behavior:
  - The primary recipient (or backup if defined) calls claim.
  - Funds are released to the caller according to the contract rules.
- Contract method: claim_future_self.

--------------------------------
DASHBOARDS & UX ELEMENTS
--------------------------------
Creator Dashboard:
- Shows:
  - All proposals created by the user.
  - Status of each project (Funding, In Progress, Completed, Refunding, etc.).
  - Milestones with:
    - amount,
    - current status (Not Started / Proof Submitted / Voting / Approved / Paid),
    - action buttons (Submit Proof, View Votes, Claim Payout).
- Used for:
  - Creating new proposals.
  - Managing existing campaigns.
  - Submitting proofs and claiming milestone payouts.

Donor Dashboard:
- Shows:
  - Projects the user has backed.
  - Donation amounts per project.
  - Voting status and results for each milestone.
  - Any refundable projects/amounts if inactivity conditions are met.
- Used for:
  - Reviewing milestone proofs.
  - Voting For or Against milestones.
  - Claiming proportional refunds if eligible.

Future Self Dashboard:
- Shows:
  - All "future self" deposits created by or for the user.
  - Unlock times and whether each deposit is claimable.
  - Who is the primary and backup recipient.
- Used for:
  - Creating new future-self contracts.
  - Monitoring time-locked funds.
  - Claiming funds after unlock_time.

Tinyman DEX Swap Integration:
- There is an embedded Tinyman DEX swap widget/section.
- Purpose:
  - Allow users to swap between Algo and other ASA tokens directly inside the platform.
  - Helpful if a user wants to convert assets before donating or before funding their future self.
- UX:
  - Typically accessible via a "Swap" / "Trade" or "Tinyman" tab or button.
  - Should be explained as a utility feature, not as investment advice.

--------------------------------
ASSISTANT BEHAVIOR IN THE APP
--------------------------------
- When a user asks about:
  - "how to use the site",
  - "how to create a project",
  - "how to donate",
  - "how to fund my future self",
  - "how to vote", "how refunds work",
  - "how to use Tinyman swap",
  - or anything about navigation:
    -> Give clear, step-by-step guidance mapped to the above workflows.
    -> Refer to screen areas generically if you don't know exact labels (e.g., "go to the Crowdfunding page and open your Creator Dashboard", "look for the 'Future Self' tab in the main navigation").
- Keep answers short and practical (1–4 bullet points or short steps).
- Stay within the actual functionality described above; if something is unknown, say so briefly.
`;

// --- Mock Data (kept, can be used for examples or stats) ---
const MOCK_PLATFORM_DATA = {
  proposals: [
    { id: 'P001', title: 'Community Garden Revitalization', goal: 5000, raised: 3200, status: 'In Progress' },
    { id: 'P002', title: 'Tech Skills Workshop Series', goal: 2500, raised: 2500, status: 'Completed' },
    { id: 'P003', title: 'Local Art Installation', goal: 10000, raised: 1500, status: 'Funding' },
  ],
  proofSubmissions: [
    {
      proposalId: 'P001',
      date: '2025-10-25',
      type: 'Expense',
      details: 'Purchased 10 bags of soil and compost.',
      cost: 300,
      proofUrl: 'https://placehold.co/150x50/38bdf8/ffffff?text=Soil+Receipt',
    },
    {
      proposalId: 'P001',
      date: '2025-10-26',
      type: 'Photo Update',
      details: 'Photo of the garden area cleared and prepped for planting.',
      proofUrl: 'https://placehold.co/150x50/10b981/ffffff?text=Garden+Photo',
    },
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
    const model: GenerativeModel = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      systemInstruction: `
        You are the in-app assistant for the Fact Funders platform.
        Use the provided PLATFORM_KNOWLEDGE and MOCK_PLATFORM_DATA as your source of truth
        about how the website works, its features, and workflows.
        Your goals:
        - Help users navigate the site (where to click, which dashboard/section to use).
        - Explain how crowdfunding and future-self funding work on this platform.
        - Explain how donor voting, refunds, and Tinyman swap integrate into the user journey.
        - Keep answers concise and friendly (ideally under 4 sentences, or a few short bullet points).
        - If a user asks something unrelated to Fact Funders, you may still answer normally,
          but prioritize platform-related guidance when relevant.
      `,
    });

    const promptText = `
PLATFORM_KNOWLEDGE:
${PLATFORM_KNOWLEDGE}

MOCK_PLATFORM_DATA (for context/examples):
${JSON.stringify(MOCK_PLATFORM_DATA, null, 2)}

User message:
${userQuery}

Instructions:
- If the user seems confused about where to go on the site, give them simple navigation steps.
- You don't know exact button labels, so use generic phrases like:
  "go to the Creator Dashboard", "open the Crowdfunding page", "look for the Future Self section", or "open the Tinyman Swap tab".
- If the user asks about smart contract behavior, explain it using the workflows above in simple language.
`.trim();

    const promptParts: (string | { inlineData: { data: string; mimeType: string } })[] = [promptText];

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
    {
      role: 'bot',
      text: "Hi! I'm the Fact Funders assistant. Ask me anything about crowdfunding, future self funding, or how to use this site.",
      sources: [],
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<UploadedFileState | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory, isOpen]);

  const handleSendMessage = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!input.trim() || loading) return;

      const userQuery = input.trim();
      const currentFile = uploadedFile;

      setChatHistory(prev => [
        ...prev,
        { role: 'user', text: userQuery, sources: [], file: currentFile?.fileName },
      ]);
      setInput('');
      setLoading(true);
      setUploadedFile(null);

      try {
        const { text, sources } = await generateContent(userQuery, currentFile);
        setChatHistory(prev => [...prev, { role: 'bot', text, sources }]);
      } catch (error: any) {
        setChatHistory(prev => [
          ...prev,
          { role: 'bot', text: `Error: ${error.message}`, sources: [] },
        ]);
      } finally {
        setLoading(false);
      }
    },
    [input, loading, uploadedFile],
  );

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
            fileName: file.name,
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
            <button
              onClick={() => setIsOpen(false)}
              className="hover:bg-indigo-600 rounded-full p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {chatHistory.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] p-3 rounded-xl text-sm ${
                    msg.role === 'user'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white shadow text-gray-800 border border-gray-100'
                  }`}
                >
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
          <form
            onSubmit={handleSendMessage}
            className="p-3 bg-white border-t border-gray-100 flex items-center space-x-2"
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              className="hidden"
              accept="image/*"
            />

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className={`p-2 rounded-full hover:bg-gray-100 ${
                uploadedFile ? 'text-indigo-600' : 'text-gray-400'
              }`}
            >
              <FileText className="w-5 h-5" />
            </button>

            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Ask about crowdfunding, future self, or navigation..."
              className="flex-1 bg-gray-100 border-0 rounded-full px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
            />

            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="p-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 disabled:opacity-50"
            >
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

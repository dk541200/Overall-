import React, { useState } from 'react';
import { ArrowLeft, Send, Wrench, ShieldAlert, X, MessageSquare, CheckCircle2 } from 'lucide-react';
import type { MechanicChat } from '../types/index.ts';
import { COMMON_PROBLEMS } from '../data/initialProducts.ts';

interface MechanicChatPageProps {
  isOpen: boolean;
  onClose: () => void;
  chats: MechanicChat[];
  onSendMessage: (problemId: string, text: string) => void;
}

export const MechanicChatPage: React.FC<MechanicChatPageProps> = ({
  isOpen,
  onClose,
  chats,
  onSendMessage,
}) => {
  if (!isOpen) return null;

  const [activeProblemId, setActiveProblemId] = useState<string>(COMMON_PROBLEMS[0].id);
  const [inputText, setInputText] = useState('');

  const currentProblem =
    COMMON_PROBLEMS.find((p) => p.id === activeProblemId) || COMMON_PROBLEMS[0];
  const currentChat = chats.find((c) => c.problem === activeProblemId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    onSendMessage(activeProblemId, inputText.trim());
    setInputText('');
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-[#f7f4ee] overflow-y-auto animate-fade-in text-[#171717]"
      role="region"
      aria-label="Mechanic diagnostic chat page"
    >
      {/* Top Header Bar */}
      <header className="sticky top-0 z-20 bg-[#fffdf8]/90 backdrop-blur-md border-b border-[#171717]/10 px-4 sm:px-8 py-3.5 sm:py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          <button
            onClick={onClose}
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-[#171717] hover:text-[#ef531d] transition-colors py-1 px-2.5 rounded-lg bg-[#eee8dd] hover:bg-[#ded6c9]"
            aria-label="Return to store"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Store</span>
          </button>

          <div className="flex items-center gap-2">
            <span className="text-xs text-[#777168] font-bold hidden sm:inline">
              Workshop Consultation
            </span>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-lg bg-[#eee8dd] hover:bg-[#ded6c9] text-[#171717] flex items-center justify-center transition-colors"
              aria-label="Close page"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Full-Page Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-8 py-6 sm:py-8 pb-32">
        {/* Page Head */}
        <div className="border-b border-[#171717]/10 pb-5 mb-6">
          <div className="inline-flex items-center gap-2 text-[#ef531d] text-xs font-black tracking-widest uppercase mb-1.5">
            <Wrench className="w-4 h-4" />
            <span>Ask the workshop</span>
          </div>
          <h1 className="font-display text-4xl sm:text-6xl font-black text-[#171717] leading-none mb-2">
            CHAT WITH <span className="text-[#ef531d]">MECHANIC.</span>
          </h1>
          <p className="text-xs sm:text-sm text-[#696862] max-w-2xl leading-relaxed">
            Choose a common problem category or describe your issue. Our diagnostic team provides advice on symptoms, safety requirements, and parts replacement.
          </p>
        </div>

        {/* 2-Column Responsive Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* Diagnostic Issues Sidebar */}
          <div className="lg:col-span-4 bg-[#fffdf8] border border-[#e5decb] rounded-2xl p-4 sm:p-5 shadow-sm space-y-2">
            <h2 className="text-xs font-black uppercase text-[#171717] tracking-wider mb-3">
              Common Vehicle Issues
            </h2>

            <div className="grid grid-cols-2 lg:grid-cols-1 gap-2">
              {COMMON_PROBLEMS.map((prob) => {
                const isActive = prob.id === activeProblemId;
                const hasHistory = chats.some((c) => c.problem === prob.id && c.messages.length > 1);
                return (
                  <button
                    key={prob.id}
                    onClick={() => setActiveProblemId(prob.id)}
                    className={`text-left p-3.5 rounded-xl font-bold text-xs transition-all flex items-center justify-between ${
                      isActive
                        ? 'bg-[#ef531d] text-white shadow-sm ring-2 ring-[#ef531d]/20'
                        : 'bg-[#faf7f0] text-[#171717] hover:bg-[#f1ebe0] border border-[#e3dbcd]'
                    }`}
                  >
                    <span>{prob.title}</span>
                    {hasHistory && (
                      <span className={`w-2 h-2 rounded-full ${isActive ? 'bg-white' : 'bg-[#ef531d]'}`} />
                    )}
                  </button>
                );
              })}
            </div>

            <div className="mt-4 pt-4 border-t border-[#171717]/10">
              <div className="flex items-start gap-2.5 p-3 bg-[#fef5e7] border border-[#f5dcba] rounded-xl text-xs text-[#874b00]">
                <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5 text-[#ef531d]" />
                <span className="leading-relaxed">
                  For safety-critical brake or steering vibration, stop driving immediately and arrange a professional in-person inspection.
                </span>
              </div>
            </div>
          </div>

          {/* Chat Window */}
          <div className="lg:col-span-8 bg-[#fffdf8] border border-[#e5decb] rounded-2xl shadow-sm flex flex-col min-h-[500px] sm:min-h-[560px] overflow-hidden">
            {/* Chat Room Top Bar */}
            <div className="px-5 py-4 border-b border-[#171717]/10 bg-[#faf6ee] flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-[#ef531d]" />
                <h3 className="font-display text-lg font-black text-[#171717] tracking-wide">
                  {currentProblem.title}
                </h3>
              </div>
              <span className="text-[0.72rem] text-[#1e7e34] font-bold bg-[#e3f4e6] px-2.5 py-1 rounded-full flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                Technician Available
              </span>
            </div>

            {/* Messages Scroll Area */}
            <div className="flex-1 p-5 sm:p-6 overflow-y-auto space-y-4 bg-[#fbf9f4]">
              {!currentChat || currentChat.messages.length === 0 ? (
                <div className="p-6 bg-[#f4eee4] rounded-2xl text-xs text-[#595248] text-center max-w-md mx-auto my-12">
                  Select a category or describe your vehicle symptoms below to consult our technician.
                </div>
              ) : (
                currentChat.messages.map((msg, idx) => {
                  const isMe = msg.from === 'customer';
                  return (
                    <div
                      key={idx}
                      className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                    >
                      <span className="text-[0.68rem] font-bold text-[#797168] mb-1 px-1">
                        {isMe ? 'You' : 'AUTOFLUX Workshop Technician'}
                      </span>
                      <div
                        className={`max-w-[88%] sm:max-w-[80%] rounded-2xl px-4 py-3 text-xs sm:text-sm leading-relaxed ${
                          isMe
                            ? 'bg-[#ef531d] text-white rounded-br-none shadow-sm'
                            : 'bg-[#eee9df] text-[#191817] rounded-bl-none border border-[#dfd7c8]'
                        }`}
                      >
                        {msg.text}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Input Bar */}
            <form onSubmit={handleSubmit} className="p-3.5 sm:p-4 bg-[#faf6ee] border-t border-[#171717]/10 flex gap-2.5">
              <input
                type="text"
                placeholder="Describe your symptoms, vehicle make/model, sounds..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="flex-1 bg-white text-[#171717] border border-[#d9d3c8] rounded-xl px-4 py-3 text-xs sm:text-sm outline-none focus:border-[#ef531d]"
              />
              <button
                type="submit"
                className="bg-[#ef531d] hover:bg-[#d84512] text-white px-5 sm:px-6 py-3 rounded-xl font-bold text-xs uppercase flex items-center gap-1.5 transition-colors shrink-0 shadow-md shadow-[#ef531d]/20"
              >
                <span>Send</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};

import React, { useState } from 'react';
import { X, Send, Wrench, ShieldAlert } from 'lucide-react';
import type { MechanicChat } from '../types/index.ts';
import { COMMON_PROBLEMS } from '../data/initialProducts.ts';

interface MechanicChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  chats: MechanicChat[];
  onSendMessage: (problemId: string, text: string) => void;
}

export const MechanicChatModal: React.FC<MechanicChatModalProps> = ({
  isOpen,
  onClose,
  chats,
  onSendMessage,
}) => {
  if (!isOpen) return null;

  const [activeProblemId, setActiveProblemId] = useState<string>(COMMON_PROBLEMS[0].id);
  const [inputText, setInputText] = useState('');

  const currentProblem = COMMON_PROBLEMS.find((p) => p.id === activeProblemId) || COMMON_PROBLEMS[0];
  const currentChat = chats.find((c) => c.problem === activeProblemId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    onSendMessage(activeProblemId, inputText.trim());
    setInputText('');
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-sm overflow-y-auto"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-[#fffdf8] text-[#191817] border border-[#e3dbcf] rounded-2xl w-full max-w-4xl h-[88vh] max-h-[750px] overflow-hidden shadow-2xl flex flex-col my-auto">
        {/* Header */}
        <div className="bg-[#fffdf8] px-6 py-4 border-b border-[#171717]/10 flex items-center justify-between shrink-0">
          <div>
            <div className="flex items-center gap-2 text-[#ef531d] text-[0.68rem] font-black uppercase tracking-widest">
              <Wrench className="w-4 h-4" />
              <span>Workshop Diagnostics</span>
            </div>
            <h2 className="font-display text-2xl sm:text-3xl font-black text-[#171717]">
              CHAT WITH <span className="text-[#ef531d]">MECHANIC.</span>
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-lg bg-[#eee8dd] hover:bg-[#ded6c9] text-[#171717] flex items-center justify-center transition-colors"
            aria-label="Close mechanic chat"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 2-Column Split: Topics & Chat */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-3 overflow-hidden">
          {/* Problem Selector Sidebar */}
          <div className="bg-[#f7f3ea] p-4 border-b md:border-b-0 md:border-r border-[#171717]/10 overflow-y-auto flex md:flex-col gap-2 shrink-0">
            <span className="text-[0.68rem] font-black uppercase text-[#797168] mb-1 hidden md:block">
              Choose Diagnostic Issue
            </span>
            {COMMON_PROBLEMS.map((prob) => {
              const isActive = prob.id === activeProblemId;
              return (
                <button
                  key={prob.id}
                  onClick={() => setActiveProblemId(prob.id)}
                  className={`text-left p-3 rounded-xl font-bold text-xs transition-all whitespace-nowrap md:whitespace-normal shrink-0 ${
                    isActive
                      ? 'bg-[#ef531d] text-white shadow-sm'
                      : 'bg-white text-[#171717] hover:bg-[#eae4d6] border border-[#dcd4c6]'
                  }`}
                >
                  {prob.title}
                </button>
              );
            })}

            <div className="mt-auto hidden md:block pt-4 border-t border-[#171717]/10">
              <div className="flex items-start gap-2 p-2.5 bg-[#fef5e7] border border-[#f5dcba] rounded-lg text-[0.68rem] text-[#874b00]">
                <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5 text-[#ef531d]" />
                <span>
                  Immediate inspection recommended for brake and steering faults.
                </span>
              </div>
            </div>
          </div>

          {/* Chat Messages and Input */}
          <div className="md:col-span-2 flex flex-col bg-[#fffdf8] overflow-hidden">
            {/* Active Thread Title */}
            <div className="px-5 py-3 border-b border-[#171717]/10 bg-[#faf6ee] text-xs font-bold text-[#171717] flex items-center justify-between">
              <span>Topic: {currentProblem.title}</span>
              <span className="text-[0.68rem] text-[#797168] font-normal">
                Online Diagnostic Assistant
              </span>
            </div>

            {/* Messages Scroll Area */}
            <div className="flex-1 p-5 overflow-y-auto space-y-3.5">
              {!currentChat || currentChat.messages.length === 0 ? (
                <div className="p-4 bg-[#f4eee4] rounded-xl text-xs text-[#595248]">
                  Select an issue or describe your vehicle symptoms below to consult our technician.
                </div>
              ) : (
                currentChat.messages.map((msg, idx) => {
                  const isMe = msg.from === 'customer';
                  return (
                    <div
                      key={idx}
                      className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                    >
                      <span className="text-[0.65rem] font-bold text-[#797168] mb-1 px-1">
                        {isMe ? 'You' : 'AUTOFLUX Senior Mechanic'}
                      </span>
                      <div
                        className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs sm:text-sm leading-relaxed ${
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
            <form onSubmit={handleSubmit} className="p-3 bg-[#f7f3ea] border-t border-[#171717]/10 flex gap-2">
              <input
                type="text"
                placeholder="Describe your symptoms, vehicle make/model, sounds..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="flex-1 bg-white text-[#171717] border border-[#d9d3c8] rounded-xl px-4 py-2.5 text-xs sm:text-sm outline-none focus:border-[#ef531d]"
              />
              <button
                type="submit"
                className="bg-[#ef531d] hover:bg-[#d84512] text-white px-5 py-2.5 rounded-xl font-bold text-xs uppercase flex items-center gap-1.5 transition-colors shrink-0"
              >
                <span>Send</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

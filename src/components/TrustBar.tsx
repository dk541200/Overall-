import React from 'react';
import { Target, FileCheck, Send, Headphones } from 'lucide-react';

export const TrustBar: React.FC = () => {
  const items = [
    {
      icon: <Target className="w-5 h-5 text-[#ef531d]" />,
      title: 'FITMENT GUIDANCE',
      sub: 'Choose your vehicle',
    },
    {
      icon: <FileCheck className="w-5 h-5 text-[#ef531d]" />,
      title: 'DETAILS UP FRONT',
      sub: "Know what you're viewing",
    },
    {
      icon: <Send className="w-5 h-5 text-[#ef531d]" />,
      title: 'PRE-ORDER REQUESTS',
      sub: 'Ask us to source a part',
    },
    {
      icon: <Headphones className="w-5 h-5 text-[#ef531d]" />,
      title: 'HUMAN SUPPORT',
      sub: 'Confirm compatibility',
    },
  ];

  return (
    <div className="bg-[#fffdf8] border-y border-[#e7dfd3]">
      <div className="max-w-7xl mx-auto grid grid-cols-2 lg:grid-cols-4 divide-y lg:divide-y-0 sm:divide-x divide-[#e7dfd3]">
        {items.map((item, idx) => (
          <div
            key={idx}
            className="flex items-center gap-3.5 p-4 sm:p-5 hover:bg-[#faf6ee] transition-colors"
          >
            <div className="p-2.5 bg-[#f5ede0] rounded-lg shrink-0">
              {item.icon}
            </div>
            <div>
              <strong className="block text-xs sm:text-sm font-black text-[#201d19] tracking-wider uppercase font-display">
                {item.title}
              </strong>
              <small className="text-[0.72rem] text-[#777168] font-medium">
                {item.sub}
              </small>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

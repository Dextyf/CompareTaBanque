import React, { useState } from 'react';
import { MessageSquare, X, Send, Bot } from 'lucide-react';

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'ai', content: "Bonjour Jean ! Je suis Claude, votre assistant IA de CompareTaBanque. Avez-vous une question sur votre dernier score (Coris Bank - 92/100) ?" }
  ]);
  const [input, setInput] = useState('');

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = input.trim();
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setInput('');

    // Mock AI response
    setTimeout(() => {
      setMessages(prev => [...prev, { 
        role: 'ai', 
        content: `Pour votre demande: "${userMsg}", la Directive 07/2010 UEMOA stipule que l'accès aux tarifs est un droit. Coris Bank offre actuellement 5% sur l'Épargne Prestige, ce qui est le plus haut du marché face à votre profil. Souhaitez-vous contacter un autre partenaire pour un second avis ?` 
      }]);
    }, 1500);
  };

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <button 
          onClick={() => setIsOpen(true)}
          className="bg-fintech-dark text-white p-4 rounded-full shadow-2xl hover:scale-110 transition-transform relative group"
        >
          <Bot size={28} />
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full border-2 border-white">
            1
          </span>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="bg-white w-80 md:w-96 h-[500px] flex flex-col rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.2)] border border-slate-200 overflow-hidden animate-fadeIn">
          {/* Header */}
          <div className="bg-fintech-dark text-white p-4 flex justify-between items-center">
            <div className="flex items-center gap-2 font-bold">
               <Bot size={20} className="text-fintech-accent" /> Assistant IA Claude
            </div>
            <button onClick={() => setIsOpen(false)} className="text-slate-300 hover:text-white">
              <X size={20} />
            </button>
          </div>

          {/* Messages Feed */}
          <div className="flex-1 p-4 overflow-y-auto bg-slate-50 space-y-4">
             {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`p-3 rounded-2xl max-w-[80%] text-sm shadow-sm ${
                    msg.role === 'user' 
                      ? 'bg-fintech-blue text-white rounded-br-none' 
                      : 'bg-white text-slate-800 border border-slate-100 rounded-bl-none'
                  }`}>
                    {msg.content}
                  </div>
                </div>
             ))}
          </div>

          {/* Input Area */}
          <div className="p-4 bg-white border-t border-slate-100">
            <form onSubmit={handleSend} className="relative">
              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Posez une question sur les banques..."
                className="w-full pl-4 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-full focus:outline-none focus:ring-2 focus:ring-fintech-accent text-sm"
              />
              <button 
                type="submit"
                className="absolute right-2 top-1.5 p-1.5 text-white bg-fintech-accent rounded-full hover:bg-green-600 transition-colors"
              >
                <Send size={16} />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

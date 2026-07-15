import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageCircle, X, Send, Loader2, Bot } from 'lucide-react';
import { apiQueryChatbot } from '../api';

interface Message {
  id: string;
  sender: 'user' | 'bot';
  text: string;
}

/** Strip markdown artifacts and render a clean, readable message */
function formatBotMessage(text: string): React.ReactNode {
  const cleaned = text
    .replace(/\*\*(.+?)\*\*/g, '$1')   // remove bold **x**
    .replace(/\*(.+?)\*/g, '$1')        // remove italic *x*
    .replace(/^#{1,6}\s+/gm, '')        // remove headers
    .replace(/^\s*[-–]\s+/gm, '• ');   // normalize bullet dashes to •

  const lines = cleaned.split('\n').filter(l => l.trim() !== '');

  return (
    <span className="flex flex-col gap-1.5">
      {lines.map((line, i) => {
        const numbered = line.match(/^(\d+)\.\s+(.+)/);
        if (numbered) {
          return (
            <span key={i} className="flex gap-2">
              <span className="font-semibold text-slate-400 shrink-0 w-4">{numbered[1]}.</span>
              <span>{numbered[2]}</span>
            </span>
          );
        }
        if (line.startsWith('• ')) {
          return (
            <span key={i} className="flex gap-2">
              <span className="text-slate-400 shrink-0">•</span>
              <span>{line.slice(2)}</span>
            </span>
          );
        }
        return <span key={i}>{line}</span>;
      })}
    </span>
  );
}

export const ChatbotWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', sender: 'bot', text: 'Namaste! I am Setu, your NagrikSetu assistant. How can I help you today?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { id: Date.now().toString(), sender: 'user', text: input.trim() };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await apiQueryChatbot(userMessage.text);
      const botMessage: Message = { id: (Date.now() + 1).toString(), sender: 'bot', text: response.reply };
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Chatbot error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: 'Sorry, I am having trouble connecting to the server. Please try again later.'
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Action Button */}
      <motion.button
        className={`fixed bottom-6 right-6 w-14 h-14 bg-slate-900 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-slate-800 transition-colors z-[100] ${isOpen ? 'hidden' : 'flex'}`}
        onClick={() => setIsOpen(true)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <MessageCircle size={24} />
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-6 right-6 w-[350px] h-[500px] max-h-[80vh] max-w-[calc(100vw-48px)] bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col z-[100] overflow-hidden"
          >
            {/* Header */}
            <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 bg-slate-700 rounded-full flex items-center justify-center shrink-0">
                  <Bot size={18} />
                </div>
                <div>
                  <h3 className="font-semibold text-sm leading-none">Setu</h3>
                  <p className="text-slate-400 text-xs mt-0.5">NagrikSetu Assistant</p>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-slate-300 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 p-4 overflow-y-auto bg-slate-50 flex flex-col gap-3">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] px-3 py-2.5 rounded-2xl text-sm leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-slate-900 text-white rounded-tr-sm'
                      : 'bg-white text-slate-800 border border-slate-200 rounded-tl-sm'
                  }`}>
                    {msg.sender === 'bot' ? formatBotMessage(msg.text) : msg.text}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="px-3 py-2.5 rounded-2xl bg-white text-slate-800 border border-slate-200 rounded-tl-sm flex items-center gap-2">
                    <Loader2 size={14} className="animate-spin text-slate-400" />
                    <p className="text-sm text-slate-400">Setu is typing...</p>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-3 bg-white border-t border-slate-200">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  className="flex-1 px-4 py-2 bg-slate-100 border border-transparent focus:bg-white focus:border-slate-300 rounded-full text-sm outline-none transition-all"
                  placeholder="Ask Setu anything..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                  className="w-10 h-10 bg-slate-900 text-white rounded-full flex items-center justify-center hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shrink-0"
                >
                  <Send size={16} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

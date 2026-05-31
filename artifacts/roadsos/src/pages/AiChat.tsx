import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Send, Bot, User, Mic } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { useGetChatHistory, getGetChatHistoryQueryKey, useSendChatMessage } from "@workspace/api-client-react";

export default function AiChat() {
  const { userId } = useAuth();
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const { data: history, refetch } = useGetChatHistory({ query: { queryKey: getGetChatHistoryQueryKey() } });
  const sendMutation = useSendChatMessage();

  // Local state for optimistic updates
  const [messages, setMessages] = useState<any[]>([]);

  useEffect(() => {
    if (history) {
      setMessages(history);
    } else {
      // Initial greeting if no history
      setMessages([{
        id: 'init',
        role: 'assistant',
        content: 'ROADSOS AI Agent online. State your emergency or request assistance.',
        createdAt: new Date().toISOString()
      }]);
    }
  }, [history]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, sendMutation.isPending]);

  const handleSend = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || sendMutation.isPending) return;

    const userMsg = input;
    setInput("");

    // Optimistic add
    const tempId = Date.now().toString();
    setMessages(prev => [...prev, { id: tempId, role: 'user', content: userMsg }]);

    sendMutation.mutate({
      data: {
        userId: userId || "demo-user",
        message: userMsg
      }
    }, {
      onSuccess: (data) => {
        setMessages(prev => [...prev, data]);
        refetch(); // sync with server
      }
    });
  };

  const quickPrompts = [
    "I had an accident",
    "CPR Instructions",
    "Where is the nearest hospital?",
    "Call ambulance"
  ];

  return (
    <div className="h-screen bg-background flex flex-col pb-20">
      <header className="p-4 border-b border-white/5 bg-background/80 backdrop-blur-md z-10 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-accent/20 border border-accent flex items-center justify-center">
          <Bot className="w-6 h-6 text-accent" />
        </div>
        <div>
          <h1 className="font-orbitron font-bold text-white tracking-wider">AI ASSISTANT</h1>
          <p className="text-[10px] text-green-500 uppercase tracking-widest flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span> Online
          </p>
        </div>
      </header>

      {/* Quick Prompts */}
      <div className="p-3 flex gap-2 overflow-x-auto scrollbar-hide no-scrollbar border-b border-white/5 bg-black/20">
        {quickPrompts.map(prompt => (
          <button
            key={prompt}
            onClick={() => setInput(prompt)}
            className="px-3 py-1.5 rounded-full text-xs border border-white/10 bg-white/5 text-white/70 whitespace-nowrap hover:bg-white/10 hover:text-white transition-colors"
          >
            {prompt}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, i) => (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            key={msg.id || i}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} max-w-full`}
          >
            <div className={`flex gap-2 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center mt-1 ${
                msg.role === 'user' ? 'bg-primary/20 border border-primary/50 text-primary' : 'bg-accent/20 border border-accent/50 text-accent'
              }`}>
                {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>
              
              <div className={`p-3 rounded-2xl ${
                msg.role === 'user' 
                  ? 'bg-primary/10 border border-primary/20 text-white rounded-tr-sm' 
                  : 'glass-card border-white/10 text-white/90 rounded-tl-sm'
              }`}>
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
              </div>
            </div>
          </motion.div>
        ))}
        
        {sendMutation.isPending && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
            <div className="flex gap-2 max-w-[85%]">
              <div className="w-8 h-8 rounded-full bg-accent/20 border border-accent/50 text-accent flex items-center justify-center mt-1">
                <Bot className="w-4 h-4" />
              </div>
              <div className="glass-card border-white/10 p-4 rounded-2xl rounded-tl-sm flex items-center gap-1">
                <div className="w-1.5 h-1.5 bg-accent rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
                <div className="w-1.5 h-1.5 bg-accent rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
                <div className="w-1.5 h-1.5 bg-accent rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
              </div>
            </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 bg-background border-t border-white/5">
        <form onSubmit={handleSend} className="flex gap-2">
          <Button type="button" size="icon" variant="outline" className="border-white/10 bg-black shrink-0">
            <Mic className="w-4 h-4 text-muted-foreground" />
          </Button>
          <Input 
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="State emergency or request..."
            className="flex-1 bg-black border-white/20 focus:border-accent text-white"
          />
          <Button type="submit" size="icon" disabled={!input.trim() || sendMutation.isPending} className="bg-accent hover:bg-accent/80 text-black shrink-0 neon-box-blue">
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}
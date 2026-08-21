import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { MessageSquare, X, Send, Bot, User, Minimize2, Maximize2 } from 'lucide-react';
import aiChatService from '../../services/aiChatService';

const getSuggestions = (role, pathname) => {
  const roleStr = (role || 'Guest').toUpperCase();
  const isGuest = roleStr.includes('GUEST') || roleStr.includes('UNREGISTERED');

  if (isGuest) {
    if (pathname.includes('/register')) {
      return ['How do I create an account?', 'What are the password requirements?', 'What roles are available?'];
    }
    return ['How do I login?', 'What is ProCure?', 'I forgot my password'];
  }

  // Role-specific and page-specific suggestions
  if (roleStr.includes('ADMIN')) {
    return ['How do I manage users?', 'View system audit logs', 'Configure system settings'];
  }
  
  if (roleStr.includes('MANAGER')) {
    if (pathname.includes('/approvals')) return ['How do I approve requests?', 'What is pending?'];
    return ['Pending approvals', 'View budget utilization', 'Generate department report'];
  }
  
  if (roleStr.includes('FINANCE')) {
    return ['View invoices', 'Pending payments', 'Budget overview'];
  }
  
  if (roleStr.includes('PROCUREMENT') || roleStr.includes('BUYER')) {
    return ['Pending purchase orders', 'View suppliers', 'Inventory status'];
  }
  
  // Default Employee/Staff
  if (pathname.includes('/requisitions/new')) {
    return ['How do I submit a requisition?', 'What is the approval workflow?', 'Check item catalog'];
  }
  
  if (pathname.includes('/orders')) {
    return ['Track my recent orders', 'How to report a missing item?', 'View order history'];
  }

  return ['How do I create a new requisition?', 'Track my orders', 'Who is my manager?'];
};

export default function AIChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hi there! I am your ProCure AI Assistant. How can I help you today?' }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const { user } = useAuth();
  const location = useLocation();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSendMessage = async (e, textOverride) => {
    if (e) e.preventDefault();
    const userMsg = textOverride || inputValue.trim();
    if (!userMsg || isLoading) return;

    setInputValue('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsLoading(true);

    try {
      // Pass the user role and current page path
      const roleStr = user?.role ? user.role : 'Guest/Unregistered';
      const pageContext = location.pathname;

      const response = await aiChatService.sendMessage(userMsg, roleStr, pageContext);
      
      setMessages(prev => [...prev, { role: 'assistant', content: response.aiReply }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I am having trouble connecting to the server right now.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    handleSendMessage(null, suggestion);
  };

  if (!isOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-50 group">
        <div className="absolute inset-0 bg-primary-600 rounded-full animate-ping opacity-75"></div>
        <button
          onClick={() => { setIsOpen(true); setIsMinimized(false); }}
          className="relative w-14 h-14 bg-primary-600 hover:bg-primary-700 text-white rounded-full flex items-center justify-center shadow-2xl shadow-primary-500/40 transition-transform group-hover:scale-110"
          aria-label="Open AI Chatbot"
        >
          <MessageSquare className="w-6 h-6" />
        </button>
      </div>
    );
  }

  return (
    <div 
      className={`fixed right-6 z-50 flex flex-col bg-surface border border-borderLight shadow-2xl rounded-2xl overflow-hidden transition-all duration-300 ease-in-out ${
        isMinimized 
          ? 'bottom-6 w-72 h-14' 
          : 'bottom-6 w-[350px] h-[500px] sm:w-[400px] sm:h-[600px]'
      }`}
    >
      {/* Header */}
      <div className="bg-primary-600 text-white px-4 py-3 flex items-center justify-between cursor-pointer" onClick={() => setIsMinimized(!isMinimized)}>
        <div className="flex items-center gap-2">
          <Bot className="w-5 h-5" />
          <span className="font-semibold text-sm">ProCure AI Assistant</span>
        </div>
        <div className="flex items-center gap-1">
          <button 
            onClick={(e) => { e.stopPropagation(); setIsMinimized(!isMinimized); }}
            className="p-1 hover:bg-white/20 rounded-md transition-colors"
          >
            {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); setIsOpen(false); }}
            className="p-1 hover:bg-white/20 rounded-md transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Chat Area */}
      {!isMinimized && (
        <>
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-page">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`flex gap-2 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === 'user' ? 'bg-primary-100 text-primary-700' : 'bg-surface border border-borderLight text-primary-600'}`}>
                    {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                  </div>
                  <div className={`px-4 py-2 rounded-2xl text-sm ${msg.role === 'user' ? 'bg-primary-600 text-white rounded-tr-sm' : 'bg-surface border border-borderLight text-textPrimary rounded-tl-sm'}`}>
                    {msg.content}
                  </div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="flex gap-2 max-w-[85%]">
                  <div className="w-8 h-8 rounded-full bg-surface border border-borderLight text-primary-600 flex items-center justify-center flex-shrink-0">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div className="px-4 py-3 rounded-2xl rounded-tl-sm bg-surface border border-borderLight text-textPrimary flex items-center gap-1">
                    <div className="w-1.5 h-1.5 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-1.5 h-1.5 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-1.5 h-1.5 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          
          {/* Suggestions Area */}
          {!isLoading && messages.length < 5 && (
            <div className="px-3 py-3 flex gap-2 overflow-x-auto scrollbar-hide border-t border-borderLight bg-surface">
              {getSuggestions(user?.role, location.pathname).map((suggestion, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="whitespace-nowrap px-4 py-2 text-xs font-medium bg-surface border border-borderLight text-textSecondary rounded-full hover:bg-primary-500/10 hover:text-primary-600 hover:border-primary-500/30 transition-colors shadow-sm"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          )}

          {/* Input Area */}
          <div className="p-3 bg-surface border-t border-borderLight">
            <form onSubmit={handleSendMessage} className="flex items-center gap-2 relative">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Ask me anything..."
                className="w-full pl-4 pr-10 py-2.5 bg-page border border-borderLight rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/50 text-textPrimary placeholder:text-textMuted"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={!inputValue.trim() || isLoading}
                className="absolute right-1 w-8 h-8 bg-primary-600 hover:bg-primary-700 disabled:bg-borderLight disabled:text-textMuted text-white rounded-full flex items-center justify-center transition-colors"
              >
                <Send className="w-4 h-4 -ml-0.5" />
              </button>
            </form>
          </div>
        </>
      )}
    </div>
  );
}

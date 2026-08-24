import api from './api';

const aiChatService = {
  sendMessage: async (userMessage, userRole, pageContext) => {
    try {
      const response = await api.post('/api/chat', {
        userMessage,
        userRole,
        pageContext,
      });
      return response.data.data;
    } catch (error) {
      console.error('AI Chat Error:', error);
      throw error;
    }
  },
};

export default aiChatService;

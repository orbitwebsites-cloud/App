// File: src/api/chats.ts
import axios from 'axios';

const getChats = async (query: string): Promise<any[]> => {
  try {
    const response = await axios.get('/api/chats', {
      params: { query },
    });
    return response.data.chats || [];
  } catch (error) {
    console.error('Error fetching chats:', error);
    return [];
  }
};

export default getChats;
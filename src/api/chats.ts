import axios from 'axios';

const getChats = async (query: string): Promise<any[]> => {
  try {
    const response = await axios.get('/api/chats', {
      params: { query },
    });
    return response.data;
  } catch (error) {
    console.error(error);
    return [];
  }
};

export default getChats;
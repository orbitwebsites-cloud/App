// File: src/components/ChatSwitcher.tsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface ChatSwitcherProps {
  query: string;
}

interface LocalChat {
  id: number;
  name: string;
}

interface ServerChat {
  id: number;
  name: string;
}

const ChatSwitcher: React.FC<ChatSwitcherProps> = ({ query }) => {
  const [localChats, setLocalChats] = useState<LocalChat[]>([]);
  const [serverChats, setServerChats] = useState<ServerChat[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchLocalChats = async () => {
      // Fetch local chats from cache or local storage
      const localChats = await fetchLocalChatsFromCache();
      setLocalChats(localChats);
    };
    fetchLocalChats();
  }, []);

  useEffect(() => {
    const fetchServerChats = async () => {
      if (query.trim() === '') {
        setServerChats([]);
        return;
      }
      setLoading(true);
      try {
        const response = await axios.get('/api/chats', {
          params: { query },
        });
        setServerChats(response.data);
      } catch (error) {
        console.error(error);
        setServerChats([]);
      } finally {
        setLoading(false);
      }
    };
    fetchServerChats();
  }, [query]);

  return (
    <div>
      <h2>Recents</h2>
      <ul>
        {localChats.map((chat) => (
          <li key={chat.id}>{chat.name}</li>
        ))}
      </ul>
      <h2>Search Results</h2>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <ul>
          {serverChats.map((chat) => (
            <li key={chat.id}>{chat.name}</li>
          ))}
        </ul>
      )}
    </div>
  );
};

// Mock function to simulate fetching from cache
const fetchLocalChatsFromCache = async (): Promise<LocalChat[]> => {
  return [
    { id: 1, name: 'Team Chat' },
    { id: 2, name: 'General' },
  ];
};

export default ChatSwitcher;
import { isEmpty } from 'lodash';
import { ChatUtils } from '@libs/ChatUtils';

const ChatListItem = ({ chat }) => {
  // ... existing component logic ...

  const getLastMessageText = () => {
    if (!chat.lastMessage) return '';
    if (typeof chat.lastMessage === 'string') return chat.lastMessage;
    return chat.lastMessage.text || '';
  };

  const getParticipantNames = () => {
    if (isEmpty(chat.participants)) return [];
    return ChatUtils.getParticipantNames(chat.participants);
  };

  // ... rest of component using getLastMessageText() and getParticipantNames() ...
};
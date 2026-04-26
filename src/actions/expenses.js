const createExpense = (workspaceID, expense) => async (dispatch, getState) => {
  try {
    // ... existing expense creation logic ...

    // After creating expense, initialize chat with required fields for LHN
    const chatID = `${Constants.DB_TABLE_NAMES.CHAT}-${Utils.getUUID()}`;
    const chat = {
      ID: chatID,
      type: CONST.CHAT.TYPE.EXPENSE,
      expenseID: expense.ID,
      lastMessage: {
        text: '',
        timestamp: Date.now(),
      },
      participants: [Utils.getCurrentUserID()],
      isPending: true,
      // ... other existing chat fields ...
    };

    // Save chat to Optimistic DB
    await Optimistically.addToChatList(chat);
    await Optimistically.addToChat(chatID, chat);

    // ... remaining logic ...
  } catch (error) {
    // ... existing error handling ...
  }
};
function getMessages(chatId) {
  console.log('Заглушка getMessages для чата:', chatId);
  return { data: [] };
}

export async function sendMessage(chatId, text) {
  console.log('Заглушка sendMessage:', { chatId, text });
  return { data: { success: true } };
}
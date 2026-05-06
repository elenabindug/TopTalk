// import api from './axios';  // пока закомментировано

export const register = async (email, name, password) => {
  //имитируем успешный ответ
  console.log('Заглушка регистрации:', { email, name, password });
  return {
    data: {
      token: 'fake-jwt-token',
      user: { id: 1, name, email }
    }
  };
};

export const login = async (email, password) => {
  console.log('Заглушка логина:', { email, password });
  return {
    data: {
      token: 'fake-jwt-token',
      user: { id: 1, name: 'Анна', email }
    }
  };
};

export const getChats = async () => {
  console.log('Заглушка списка чатов');
  return {
    data: [
      { id: 1, name: 'Общий чат', isGroup: true },
      { id: 2, name: 'С Ваней', isGroup: false }
    ]
  };
};
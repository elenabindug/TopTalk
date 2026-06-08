const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Запуск seed...');

  // Хэши паролей
  const hashedPassword = await bcrypt.hash('123456', 10);

  // 1. Создаём пользователей
  const student = await prisma.user.upsert({
    where: { email: 'student@example.com' },
    update: {},
    create: {
      email: 'student@example.com',
      name: 'Student',
      password: hashedPassword,
      role: 'student',
    },
  });

  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      name: 'Admin',
      password: hashedPassword,
      role: 'admin',
    },
  });

  console.log('✅ Пользователи созданы:', student.email, admin.email);

  // 2. Создаём групповой чат "Общий" и добавляем обоих участников
  const generalChat = await prisma.chat.upsert({
    where: { id: 'general' }, // фиксированный id для удобства
    update: {},
    create: {
      id: 'general',
      name: 'Общий чат',
      isGroup: true,
      users: {
        connect: [{ id: student.id }, { id: admin.id }],
      },
    },
  });
  console.log('✅ Групповой чат создан:', generalChat.name);

  // 3. Создаём личный чат между student и admin
  const personalChat = await prisma.chat.create({
    data: {
      isGroup: false,
      users: {
        connect: [{ id: student.id }, { id: admin.id }],
      },
    },
  });
  console.log('✅ Личный чат создан, id:', personalChat.id);

  // 4. Добавляем несколько сообщений в общий чат
  const messagesGeneral = [
    { text: 'Всем привет!', userId: admin.id, chatId: generalChat.id },
    { text: 'Привет, админ!', userId: student.id, chatId: generalChat.id },
    { text: 'Как дела?', userId: admin.id, chatId: generalChat.id },
    { text: 'Отлично, работаем над проектом', userId: student.id, chatId: generalChat.id },
  ];

  for (const msg of messagesGeneral) {
    await prisma.message.create({ data: msg });
  }
  console.log('✅ Сообщения в общем чате добавлены');

  // 5. Добавляем сообщения в личный чат
  const messagesPersonal = [
    { text: 'Привет, это личный чат', userId: student.id, chatId: personalChat.id },
    { text: 'Понял, работаем', userId: admin.id, chatId: personalChat.id },
  ];
  for (const msg of messagesPersonal) {
    await prisma.message.create({ data: msg });
  }
  console.log('✅ Сообщения в личном чате добавлены');

  console.log('🎉 Seed завершён успешно!');
}

main()
  .catch((e) => {
    console.error('❌ Ошибка seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
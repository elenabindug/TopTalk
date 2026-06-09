const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  // Хешируем пароли
  const studentPassword = await bcrypt.hash('ывиыв', 10);
  const adminPassword = await bcrypt.hash('admin123', 10);

  // Создаём студента
  const student = await prisma.user.upsert({
    where: { email: 'andronatievelina@gmail.com' },
    update: {},
    create: {
      email: 'andronatievelina@gmail.com',
      name: 'Анна Смирнова',
      password: studentPassword,
      role: 'student'
    }
  });

  // Создаём админа
  const admin = await prisma.user.upsert({
    where: { email: 'admin@toptalk.com' },
    update: {},
    create: {
      email: 'admin@toptalk.com',
      name: 'Администратор',
      password: adminPassword,
      role: 'admin'
    }
  });

  console.log('Пользователи созданы:', { student: student.email, admin: admin.email });
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
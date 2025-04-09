import { v4 as uuidv4 } from 'uuid';
import { TokenType,type   User } from '@/prisma/generated';
import { PrismaService } from '@/src/core/prisma/prisma.service';

export async function generateToken(
  prismaService: PrismaService,
  user: User,
  type: TokenType,
  isUUID: boolean = true,
) {
  let token: string;

  // Генерация токена: UUID или числовой код
  if (isUUID) {
    token = uuidv4();
  } else {
    token = Math.floor(100000 + Math.random() * 900000).toString(); // 6-значный код
  }

  // Время истечения через 5 минут
  const expiresIn = new Date(Date.now() + 5 * 60 * 1000);

  try {
    // Проверяем существующий токен данного типа для пользователя
    const existingToken = await prismaService.token.findFirst({
      where: {
        type,
        userId: user.id,
      },
    });

    // Удаляем существующий токен, если он есть
    if (existingToken) {
      await prismaService.token.delete({
        where: {
          id: existingToken.id,
        },
      });
    }

    // Создаем новый токен
    const newToken = await prismaService.token.create({
      data: {
        token,
        expiresIn,
        type,
        userId: user.id,
      },
      include: {
        user: true


      },
    });

    return newToken;
  } catch (error) {
    console.error('Ошибка при генерации токена:', error.message);
    throw new Error('Не удалось создать токен');
  }
}

import { BadRequestException, Injectable, NotFoundException,} from '@nestjs/common';
import { PrismaService } from '@/src/core/prisma/prisma.service';
import { MailerService } from '@nestjs-modules/mailer';
import { VerificationInput } from '@/src/modules/auth/verification/input/verifi_input';
import { Request } from 'express';
import { TokenType, User } from '@prisma/generated';
import { getSessionMetadata } from '@/src/share/utils/session_metadata_utils';

import { saveSession } from '@/src/share/utils/session_utils';
import { generateToken } from '@/src/share/utils/generate_tokens';

@Injectable()
export class VerificationService {
  public constructor(
    private readonly prismaService: PrismaService,
    private readonly mailService: MailerService,
  ) {}

  public async verification(
    req: Request,
    input: VerificationInput,
    userAgent: string,
  ) {
    const { token } = input;

    // Поиск токена в базе данных
    const existingToken = await this.prismaService.token.findFirst({
      where: {
        token: token,
        type: TokenType.EMAIL_VERIFY,
      },
    });

    // Проверка на наличие токена
    if (!existingToken) {
      throw new NotFoundException('Токен не найден');
    }

    // Проверка срока действия токена
    if (existingToken.expiresIn && new Date(existingToken.expiresIn) < new Date()) {
      throw new BadRequestException('Токен истёк');
    }

    // Обновляем статус пользователя на "верифицирован"
    const user = await this.prismaService.user.update({
      where: {
        id: existingToken.userId,
      },
      data: {
        isEmailVerified: true,
      },
    });

    // Удаляем токен из базы данных
    await this.prismaService.token.delete({
      where: {
        id: existingToken.id,
      },
    });

    // Создаем метаданные сессии
    const metadata = getSessionMetadata(req, userAgent);

    // Сохраняем сессию и возвращаем пользователя
    return saveSession(req, user, metadata);
  }
  public async sendVerification(user:User) {
    await generateToken(
      this.prismaService,
      user,
      TokenType.EMAIL_VERIFY,
      true
    )
    return true
  }
}

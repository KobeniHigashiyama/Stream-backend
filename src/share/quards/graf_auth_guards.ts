import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

import { PrismaService } from '@/src/core/prisma/prisma.service';

@Injectable()
export class GqlAuthGuard implements CanActivate {
  public constructor(private readonly prismaService: PrismaService) {}

  public async canActivate(context: ExecutionContext): Promise<boolean> {
    const ctx = GqlExecutionContext.create(context);
    const request = ctx.getContext().req;

    // Проверяем наличие сессии и ID пользователя
    if (!request.session || !request.session.userid) {
      throw new UnauthorizedException('Пользователь не авторизован');
    }

    try {
      // Ищем пользователя по ID из сессии
      const user = await this.prismaService.user.findUnique({
        where: {
          id: request.session.userid,
        },
      });

      if (!user) {
        throw new UnauthorizedException('Пользователь не найден');
      }

      // Присваиваем пользователя в объект запроса
      request.user = user;
      return true;
    } catch (error) {
      console.error('Ошибка авторизации:', error.message);
      throw new UnauthorizedException('Ошибка авторизации');
    }
  }
}


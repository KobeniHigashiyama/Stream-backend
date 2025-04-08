
import { Injectable, InternalServerErrorException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '@/src/core/prisma/prisma.service';
import { LoginInput } from '@/src/modules/auth/session/input/login_input';
import type { Request } from 'express';
import { verify } from 'argon2';
import { ConfigService } from '@nestjs/config';
import { getSessionMetadata } from '@/src/share/utils/session_metadata_utils';
import { RedisService } from '@/src/core/redis/redis.service';

@Injectable()
export class SessionService {
  public constructor(
    private readonly prismaService: PrismaService,
    private readonly configService: ConfigService,
    private readonly redisService: RedisService,
  ) {}

  public async login(req: Request, input: LoginInput,userAgent:string) {
    const { login, password } = input;

    // Проверяем наличие логина и пароля
    if (!login || !password) {
      throw new UnauthorizedException('Логин и пароль обязательны');
    }
    const metadata = getSessionMetadata(req,userAgent);

    // Поиск пользователя по имени или email
    const user = await this.prismaService.user.findFirst({
      where: {
        OR: [
          { username: { equals: login } },
          { email: { equals: login } },
        ],
      },
    });

    if (!user) {
      throw new UnauthorizedException('Пользователь не найден');
    }

    // Проверка пароля
    const isValidPassword = await verify(user.password, password);
    if (!isValidPassword) {
      throw new UnauthorizedException('Неверный пароль');
    }

    // Удаляем пароль из объекта перед возвратом
    const { password: _, ...safeUser } = user;

    // Создаем сессию
    return new Promise((resolve, reject) => {
      req.session.createdAt = new Date();
      req.session.userid = user.id;
      req.session.metadata = metadata;
      req.session.save((err) => {
        if (err) {
          return reject(
            new InternalServerErrorException('Не удалось сохранить сессию'),
          );
        }
        resolve(safeUser);
      });
    });
  }

  public async logout(req: Request) {
    return new Promise((resolve, reject) => {
      req.session.destroy((err) => {
        if (err) {
          return reject(
            new InternalServerErrorException('Не удалось завершить сессию'),
          );
        }
        req.res.clearCookie(this.configService.getOrThrow<string>('SESSION_NAME'));
        resolve(true);
      });
    });
  }
  public async findByUser(req:Request, res:Response) {
    const userId = req.session.userid;
    if (!userId) {
      throw new  NotFoundException('Пользователь не обнаружен')
    }
    const keys = await this.redisService.get("*")
    const userSession = []
    for(const key of keys) {
      const sessionData = await this.redisService.get(key)
      if(sessionData){
        const session = JSON.parse(sessionData);
        if(session.userId){}
      }
    }
  }
}

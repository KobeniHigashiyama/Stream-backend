
import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '@/src/core/prisma/prisma.service';
import { LoginInput } from '@/src/modules/auth/session/input/login_input';
import type { Request } from 'express';
import { verify } from 'argon2';
import { ConfigService } from '@nestjs/config';
import { getSessionMetadata } from '@/src/share/utils/session_metadata_utils';
import { RedisService } from '@/src/core/redis/redis.service';
import { destroySession } from '@/src/share/utils/session_utils';

@Injectable()
export class SessionService {
  public constructor(
    private readonly prismaService: PrismaService,
    private readonly configService: ConfigService,
    private readonly redisService: RedisService,
  ) {}

  public async login(req: Request, input: LoginInput, userAgent: string) {
    const { login, password } = input;

    // Проверяем наличие логина и пароля
    if (!login || !password) {
      throw new UnauthorizedException('Логин и пароль обязательны');
    }

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

    // Генерация метаданных сессии
    const metadata = getSessionMetadata(req, userAgent);

    // Создаём новую сессию
    return new Promise((resolve, reject) => {
      req.session.regenerate((err) => {
        if (err) {
          return reject(new InternalServerErrorException('Ошибка при создании новой сессии'));
        }

        req.session.createdAt = new Date();
        req.session.userid = user.id;
        req.session.metadata = metadata;

        // Сохранение сессии с обработкой ошибок
        req.session.save((err) => {
          if (err) {
            return reject(new InternalServerErrorException('Не удалось сохранить сессию'));
          }
          console.log('✅ Сессия успешно создана:', req.session);
          resolve(safeUser);
        });
      });
    });
  }



  public async logout(req: Request) {
    return destroySession(req,this.configService);
  }
  public async findByUser(req:Request) {
    const userId = req.session.userid;
    if (!userId) {
      throw new  NotFoundException('Пользователь не обнаружен')
    }
    const keys = await this.redisService.keys("*")
    const userSession = []
    for(const key of keys) {
      const sessionData = await this.redisService.get(key)
      if(sessionData){
        const session = JSON.parse(sessionData);
        if(session.userId===userId){
          userSession.push({
            ...session,
            id:key.split(':')[1]
          });
        }
      }
    }
    userSession.sort((a,b)=> b.createdAt - a.createdAt);
    return  userSession.filter(session => session.id !== req.session.id);
  }
  public async findCurrentSession (req:Request) {
    const sessionId = req.session.id
    const sessionData = await this.redisService.get(
      `${this.configService.getOrThrow<string>('SESSION_FOLDER')}${sessionId}`,
    )
    const session =JSON.parse(sessionData);
    return  {
      ...session,
      id:sessionId,
    }
  }
  public async cleanSession (req:Request) {
    req.res.clearCookie(this.configService.getOrThrow<string>('SESSION_NAME'));
    return true
  }
  public async remove (req:Request,id:string) {
    if(req.session.id === id){
      throw new ConflictException('Текущию сессию удалить нельзя ')
    }
    await this.redisService.del( `${this.configService.getOrThrow<string>('SESSION_FOLDER')}${id}`)
    return true
  }

}

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../core/prisma/prisma.service';

@Injectable()
export class AccountService {
  public constructor(private readonly prismaService: PrismaService) {}
  public async  findAll() {
    const user =  await this.prismaService.user.findMany()
    return user;
  }

}


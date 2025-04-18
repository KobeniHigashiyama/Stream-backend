import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { CreateUserInput } from '@/src/modules/auth/account/input/create_user';
import { hash } from 'argon2';
import { VerificationService } from '@/src/modules/auth/verification/verification.service';

@Injectable()
export class AccountService {
  public constructor(private readonly prismaService: PrismaService,
                     private readonly verificationService: VerificationService,) {}
  public async  me (id:string) {
    const user = await this.prismaService.user.findUnique({
      where:{
        id
      }
    })
    return user;
  }
 public async  create (input:CreateUserInput) {
    const {email,username,password} = input;

    const isUsernameexist = await this.prismaService.user.findUnique({
      where:{
        username
      }
    })
   if(isUsernameexist){
     throw new UnauthorizedException('Username already exist')
   }
   const isEmailexist = await this.prismaService.user.findUnique({
     where:{
       email:email,
     }
   })
   if(isEmailexist){
     throw new UnauthorizedException('Email already exist')
   }
    const user = await this.prismaService.user.create({
     data:{
       username,
       email,
       password: await hash(password),
       displayName:username
     }
   })
   await this.verificationService.sendVerification(user)
   return true;
 }
}


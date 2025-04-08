import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { IS_DEV } from '../share/utils/is_dev';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver } from '@nestjs/apollo';
import { getGraphQLConfig } from './config/graf_config';
import { RedisModule } from './redis/redis.module';
import { AccountModule } from '../modules/auth/account/account.module';

@Module({
  imports: [ConfigModule.forRoot({
    ignoreEnvFile: !IS_DEV,
    isGlobal: true,
  }),
  GraphQLModule.forRootAsync({
    driver: ApolloDriver,
    imports:[ConfigModule],
    useFactory: getGraphQLConfig,
    inject: [ConfigService],
  }),
    PrismaModule,
    RedisModule,
    AccountModule
  ]

})
export class CoreModule {}

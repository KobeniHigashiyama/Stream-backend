import { ApolloDriverConfig } from '@nestjs/apollo';
import { ConfigService } from '@nestjs/config';
import { isDev } from '../../share/utils/is_dev';
import { join } from 'path'; // Импорт join
import * as process from 'node:process';

export function getGraphQLConfig(configService: ConfigService): ApolloDriverConfig {
  return {
    playground: isDev(configService), // Логическое значение
    path: configService.getOrThrow<string>('GRAPHQL_PREFIX'), // Получаем путь из переменной окружения
    autoSchemaFile: join(process.cwd(), 'src/core/graphql/schema.gql'), // Правильный путь
    sortSchema: true, // Сортировка схемы
    context: ({ req, res }) => ({ req, res }) // Контекст для GraphQL
  };
}

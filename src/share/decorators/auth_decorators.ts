import { applyDecorators, UseGuards } from '@nestjs/common'
import {GqlAuthGuard} from '@/src/share/quards/graf_auth_guards';

export function Authorization() {
  return applyDecorators(UseGuards(GqlAuthGuard))
}

import { Context, Resolver, Args, Mutation } from '@nestjs/graphql';
import { VerificationService } from './verification.service';
import type { GqlContext } from '@/src/share/types/gql_context';
import { VerificationInput } from '@/src/modules/auth/verification/input/verifi_input';
import { UserAgent } from '@/src/share/decorators/user_agent';
import { UserModel } from '@/src/modules/auth/account/models/user_models';

@Resolver('Verification')
export class VerificationResolver {
 public   constructor(private readonly verificationService: VerificationService) {}

@Mutation(() => UserModel, { name: 'verifyAcc' })
 public async  verify (@Context(){req}:GqlContext,
                       @Args('data') input: VerificationInput,@UserAgent() userAgent: string,){
  return this.verificationService.verification(req,input,userAgent);
 }
}

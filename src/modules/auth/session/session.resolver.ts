import { Args, Context, Mutation, Resolver } from '@nestjs/graphql';
import { SessionService } from './session.service';
import {LoginInput} from '@/src/modules/auth/session/input/login_input';
import { UserModel } from '@/src/modules/auth/account/models/user_models';
import { GqlContext } from '@/src/share/types/gql_context';
import { UserAgent } from '@/src/share/decorators/user_agent';

@Resolver('Session')
export class SessionResolver {
  public constructor(private readonly sessionService: SessionService) {}
  @Mutation(() => UserModel,{name:'login'})
  public async login(
    @Context() {req}:GqlContext,
    @Args('data') input: LoginInput,
    @UserAgent() userAgent:string
  ){
    return this.sessionService.login(req,input,userAgent);
  }
  @Mutation(() => Boolean,{name:'logout'})
  public async logout(
    @Context() {req}:GqlContext,
  ){
    return this.sessionService.logout(req)
  }

}

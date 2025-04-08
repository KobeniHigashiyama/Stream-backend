import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';
import { SessionService } from './session.service';
import {LoginInput} from '@/src/modules/auth/session/input/login_input';
import { UserModel } from '@/src/modules/auth/account/models/user_models';
import { GqlContext } from '@/src/share/types/gql_context';
import { UserAgent } from '@/src/share/decorators/user_agent';
import { SessionModel } from '@/src/modules/auth/session/models/session.models';
import {Authorization} from '@/src/share/decorators/auth_decorators';


@Resolver('Session')
export class SessionResolver {
  public constructor(private readonly sessionService: SessionService) {
  }

  @Authorization()
  @Query(() => [SessionModel], { name: "findSessionByUser" })
  public async findSessionByUser(@Context() { req }: GqlContext) {
    return this.sessionService.findByUser(req)
  }

  @Authorization()
  @Query(() => SessionModel, { name: "findCurrentSession" })
  public async findCurrentSession(@Context() { req }: GqlContext) {
    return this.sessionService.findCurrentSession(req)
  }


  @Mutation(() => UserModel, { name: 'login' })
  public async login(
    @Context() { req }: GqlContext,
    @Args('data') input: LoginInput,
    @UserAgent() userAgent: string
  ) {
    return this.sessionService.login(req, input, userAgent);
  }


  @Authorization()
  @Mutation(() => Boolean, { name: 'logout' })
  public async logout(
    @Context() { req }: GqlContext,
  ) {
    return this.sessionService.logout(req)
  }

  @Mutation(() => Boolean, { name: 'clearSessionCookie' })
  public async clearSessionCookie(
    @Context() { req }: GqlContext,
  ) {
    return this.sessionService.cleanSession(req)
  }

  @Authorization()
  @Mutation(() => Boolean, { name: 'removeSession' })
  public async removeSession(
    @Context() { req }: GqlContext,
    @Args('id') id: string,
  ) {
    return this.sessionService.remove(req, id)

  }
}

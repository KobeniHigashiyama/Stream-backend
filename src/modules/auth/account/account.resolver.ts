 import { Resolver, Query, Mutation,Args } from '@nestjs/graphql';
import { AccountService } from './account.service';
import { UserModel } from './models/user_models';
 import { CreateUserInput } from '@/src/modules/auth/account/input/create_user';
 import { Authorized } from '@/src/share/decorators/authtorized';
 import { Authorization } from '@/src/share/decorators/auth_decorators';


@Resolver(() => UserModel)
export class AccountResolver {
  constructor(private readonly accountService: AccountService) {}
  @Authorization()
  @Query(() => UserModel, { name: 'findProfile' })
  public async me(@Authorized('id') id: string) {
    return this.accountService.me(id)
  }
  @Mutation(() => Boolean,{name:'createUser'})
  public async  create(@Args('data') input: CreateUserInput) {
    return this.accountService.create(input);
  }
}

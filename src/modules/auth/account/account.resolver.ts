import { Resolver, Query } from '@nestjs/graphql';
import { AccountService } from './account.service';
import { UserModel } from './models/user_models';

@Resolver(() => UserModel)
export class AccountResolver {
  constructor(private readonly accountService: AccountService) {}

  @Query(() => [UserModel], { name: 'findAll' })
  public async findAll() {
    return this.accountService.findAll();
  }
}

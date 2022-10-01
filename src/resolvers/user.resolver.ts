import { Arg, Ctx, Mutation, Query, Resolver } from 'type-graphql';
import Context from '../../types/context';
import { CreateUserInput, LoginInput, User } from '../schema/user.schema';
import UserService from '../service/user.service';

@Resolver()
export default class UserResolver {
  constructor(private userService: UserService) {
    this.userService = new UserService();
  }

  @Mutation(() => User)
  createUser(@Arg('input') input: CreateUserInput) {
    return this.userService.createUser(input);
  }

  @Mutation(() => String)
  login(@Arg('input') input: LoginInput, @Ctx() context: Context) {
    return this.userService.login(input, context);
  }

  @Query(() => User, { nullable: true })
  me(@Ctx() context: Context) {
    return context.user;
  }
}

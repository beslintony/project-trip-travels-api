import { ApolloError } from 'apollo-server';
import { Arg, Ctx, Mutation, Query, Resolver } from 'type-graphql';
import Context from '../../types/context';
import { CreateTravelLogInput, TravelLog } from '../schema/travelLog.schema';
import TravelLogService from '../service/travelLog.service';

@Resolver()
export default class TravelLogResolver {
  constructor(private travelLogService: TravelLogService) {
    this.travelLogService = new TravelLogService();
  }

  @Mutation(() => TravelLog)
  createTravelLog(
    @Arg('input') input: CreateTravelLogInput,
    @Ctx() context: Context,
  ) {
    const user = context.user;
    if (user)
      return this.travelLogService.createTravelLog({
        ...input,
        username: user?.username,
      });
    else throw new ApolloError('User not logged in');
  }

  @Query(() => [TravelLog])
  getTravelLogs() {
    return this.travelLogService.getTravelLogs();
  }
}

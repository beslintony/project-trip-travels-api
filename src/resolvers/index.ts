import TravelLogResolver from './travelLog.resolver';
import UserResolver from './user.resolver';

export const resolvers = [UserResolver, TravelLogResolver] as const;

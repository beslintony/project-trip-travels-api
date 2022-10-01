import {
  CreateTravelLogInput,
  TravelLogModel,
} from '../schema/travelLog.schema';
import { User } from '../schema/user.schema';

class TravelLogService {
  async createTravelLog(
    input: CreateTravelLogInput & { username: User['username'] },
  ) {
    return TravelLogModel.create(input);
  }

  async getTravelLogs() {
    const travelLogs = await TravelLogModel.find().lean();
    return travelLogs;
  }
}

export default TravelLogService;

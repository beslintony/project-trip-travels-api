import { ApolloError } from 'apollo-server';
import Context from '../../types/context';
import { CreateUserInput, LoginInput, UserModel } from '../schema/user.schema';
import bcrypt from 'bcrypt';
import { signJWT } from '../util/jwt';
import config from 'config';

class UserService {
  // get user info
  async isUser({ email, userName }: { email?: string; userName?: string }) {
    const user = await UserModel.find()
      .findByEmailorUsername(email, userName)
      .lean();
    return user;
  }

  // create user
  async createUser(input: CreateUserInput) {
    // get the user info by email
    const user = await this.isUser(input);
    // throw error when no user found
    if (user) throw new ApolloError('User already exists');
    // otherwise call user model to create a user
    else return UserModel.create(input);
  }

  // login
  async login(input: LoginInput, context: Context) {
    // generic error message for login
    const genericLoginError = 'invalid credentials';
    // get user info
    const user = await this.isUser({
      userName: input.userName,
      email: input.email,
    });
    // throw error when no user found
    if (!user) throw new ApolloError(genericLoginError);
    // compare and validate password of the user with login password
    const passwordIsValid = await bcrypt.compare(input.password, user.password);
    // if password is not valid throw generic login error
    if (!passwordIsValid) throw new ApolloError(genericLoginError);

    //sign the user info with jwt
    const token = signJWT(user);

    // set a cookie for jwt
    context.res.cookie('accesToken', token, {
      maxAge: 1000 * 60 * 60 * 24 * 365 * 1, // 1 year
      httpOnly: true,
      domain: config.get('domain'),
      path: '/',
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production',
    });
    return token;
  }
}

export default UserService;

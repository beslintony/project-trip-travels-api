import { ApolloError } from 'apollo-server';
import Context from '../../types/context';
import { CreateUserInput, LoginInput, UserModel } from '../schema/user.schema';
import bcrypt from 'bcrypt';
import { signJWT } from '../util/jwt';
import config from 'config';

class UserService {
  async createUser(input: CreateUserInput) {
    //call user model to create a user
    return UserModel.create(input);
  }

  async login(input: LoginInput, context: Context) {
    // generic error message for login
    const genericLoginError = 'Invalid Email or Password';
    // get the user info by email
    const user = await UserModel.find().findByEmail(input.email).lean();
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

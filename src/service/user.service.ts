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
    const findUserWithEmail = await this.isUser({
      email: input.email,
    });
    const findUserWithUsername = await this.isUser({
      userName: input.userName,
    });

    // call user model to create a user
    if (
      findUserWithEmail?.email !== input.email &&
      findUserWithUsername?.userName !== input.userName
    )
      return UserModel.create(input);
    // throw error when email doesnot match
    else if (
      findUserWithEmail?.email === input.email &&
      findUserWithUsername?.userName !== input.userName
    )
      throw new ApolloError('Email already exists');
    // throw error when username doesnot match
    else if (
      findUserWithUsername?.userName === input.userName &&
      findUserWithEmail?.email !== input.email
    )
      throw new ApolloError('Username already exists');
    // throw error when email and username doesnot match
    else throw new ApolloError('User already exists');
  }

  // login
  async login(input: LoginInput, context: Context) {
    // generic error message for login
    const genericLoginError = 'Invalid Credentials';
    if (input.email && input.userName)
      throw new ApolloError('Use email or username at once to login');
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

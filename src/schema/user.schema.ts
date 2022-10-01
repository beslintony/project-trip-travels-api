import {
  getModelForClass,
  prop,
  pre,
  queryMethod,
  index,
} from '@typegoose/typegoose';
import { IsEmail, MaxLength, MinLength } from 'class-validator';
import { Field, InputType, ObjectType } from 'type-graphql';
import bcrypt from 'bcrypt';
import { AsQueryMethod, ReturnModelType } from '@typegoose/typegoose/lib/types';

interface QueryHelpers {
  findByEmailorUsername: AsQueryMethod<typeof findByEmailorUsername>;
}

function findByEmailorUsername(
  this: ReturnModelType<typeof User, QueryHelpers>,
  email?: User['email'],
  username?: User['username'],
) {
  if (email) return this.findOne({ email });
  else if (username) return this.findOne({ username });
  else return this.findOne({ email, username });
}
@pre<User>('save', async function () {
  if (!this.isModified('password')) {
    return;
  }
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hashSync(this.password, salt);
  this.password = hash;
})
@index({ email: 1, username: 1 }, { unique: true })
@queryMethod(findByEmailorUsername)
@ObjectType()
export class User {
  @Field(() => String)
  _id: string;

  @Field(() => String)
  @prop({ requied: true })
  firstName: string;

  @Field(() => String)
  @prop({ requied: true })
  lastName: string;

  @Field(() => String)
  @prop({ requied: true })
  username: string;

  @Field(() => String)
  @prop({ requied: true, lowercase: true })
  email: string;

  @prop({ requied: true })
  password: string;
}

@InputType()
export class CreateUserInput {
  @Field(() => String)
  firstName: string;

  @Field(() => String)
  lastName: string;

  @IsEmail()
  @Field(() => String)
  email: string;

  @MinLength(6, {
    message: 'Username must be at least 3 characters long',
  })
  @MaxLength(50, {
    message: 'Username must not be more than 50 characters',
  })
  @Field(() => String)
  username: string;

  @MinLength(6, {
    message: 'Password must be at least 6 characters long',
  })
  @MaxLength(20, {
    message: 'Password must not be more than 20 characters',
  })
  @Field(() => String)
  password: string;
}

@InputType()
export class LoginInput {
  @Field({ nullable: true })
  email?: string;

  @Field({ nullable: true })
  username?: string;

  @Field(() => String)
  password: string;
}

export const UserModel = getModelForClass<typeof User, QueryHelpers>(User, {
  schemaOptions: { timestamps: true },
});

import { getModelForClass, prop, Ref } from '@typegoose/typegoose';
import { IsNumber, MaxLength, Min, MinLength } from 'class-validator';
import { Field, InputType, ObjectType } from 'type-graphql';
import { User } from './user.schema';

@ObjectType()
export class TravelLog {
  @Field(() => String)
  _id: string;

  @Field(() => String)
  @prop({ required: true, ref: () => User, type: () => String })
  username: Ref<User>;

  @Field(() => String)
  @prop({ required: true })
  title: string;

  @Field(() => String)
  @prop({ required: true })
  description: string;

  @Field(() => Number)
  @prop({ required: true })
  rating: number;

  @Field(() => Number)
  @prop({ required: true })
  lon: number;

  @Field(() => Number)
  @prop({ required: true })
  lat: number;
}

@InputType()
export class CreateTravelLogInput {
  @Field(() => String)
  @prop({ required: true })
  @MinLength(6, {
    message: 'Title must be at least 3 characters long',
  })
  @MaxLength(50, {
    message: 'Title must not be more than 50 characters',
  })
  title: string;

  @Field(() => String)
  @prop({ required: true })
  @MinLength(3, {
    message: 'Description must be at least 3 characters long',
  })
  @MaxLength(1000, {
    message: 'Description must not be more than 1000 characters',
  })
  description: string;

  @Field(() => Number)
  @prop({ required: true })
  @IsNumber()
  rating: number;

  @Field(() => Number)
  @prop({ required: true })
  @IsNumber()
  @Min(1)
  lon: number;

  @Field(() => Number)
  @prop({ required: true })
  @IsNumber()
  @Min(1)
  lat: number;
}

export const TravelLogModel = getModelForClass<typeof TravelLog>(TravelLog, {
  schemaOptions: { timestamps: true },
});

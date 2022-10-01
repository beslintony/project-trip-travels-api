import dotenv from 'dotenv';
dotenv.config();
import 'reflect-metadata';
import express from 'express';
import { buildSchema } from 'type-graphql';
import cookieParser from 'cookie-parser';
import { ApolloServer } from 'apollo-server-express';
import {
  ApolloServerPluginLandingPageProductionDefault,
  ApolloServerPluginLandingPageGraphQLPlayground,
} from 'apollo-server-core';
import { resolvers } from './resolvers';
import { connectToMongo } from './util/db';
import { verifyJWT } from './util/jwt';
import { User } from './schema/user.schema';
import Context from '../types/context';
import authChecker from './util/authChecker';

async function bootstrap() {
  // Build the schema
  const schema = await buildSchema({
    resolvers,
    authChecker,
  });

  // Init express
  const app = express();

  app.use(cookieParser());

  // create apollo server
  const server = new ApolloServer({
    schema,
    context: (ctx: Context) => {
      const context = ctx;
      if (ctx.req.cookies.accesToken) {
        const user = verifyJWT<User>(ctx.req.cookies.accesToken);
        context.user = user;
      }
      return context;
    },
    plugins: [
      process.env.NODE_ENV === 'production'
        ? ApolloServerPluginLandingPageProductionDefault()
        : ApolloServerPluginLandingPageGraphQLPlayground(),
    ],
  });

  await server.start();

  // apply middleware to server
  server.applyMiddleware({ app });
  // app.listen on express server
  app.listen({ port: 4000 }, () => {
    console.log('App is listening on port 4000');
  });
  // connect to db
  connectToMongo();
}
bootstrap();

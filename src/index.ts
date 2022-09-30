import dotenv from "dotenv";
dotenv.config();
import "reflect-metadata";
import express from "express";
import { buildSchema } from "type-graphql";
import cookieParser from "cookie-parser";
import { ApolloServer } from "apollo-server-express";
import {
    ApolloServerPluginLandingPageProductionDefault,
    ApolloServerPluginLandingPageGraphQLPlayground
} from "apollo-server-core"
import { resolvers } from "./resolvers"
import { connectToMongo } from "./util/db";

async function bootstrap() {

    // Build the schema

    const schema = await buildSchema({
        resolvers,
        // authChecker
    })

    // Init express
    const app = express();

    app.use(cookieParser());

    // create apollo server
    const server = new ApolloServer({
        schema,
        context: (ctx) => {
            console.log(ctx)
            return ctx;
        },
        plugins: [
            process.env.NODE_ENV === "production"
                ? ApolloServerPluginLandingPageProductionDefault()
                : ApolloServerPluginLandingPageGraphQLPlayground(),
        ],
    });

    await server.start();

    // apply middleware to server
    server.applyMiddleware({ app });

    // app.listen on express server
    app.listen({ port: 4000 }, () => {
        console.log("App is listening on port 4000")
    })
    // connect to db

    connectToMongo();
}


bootstrap();

console.log("hello World");


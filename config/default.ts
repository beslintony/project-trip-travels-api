export default {
  dbUri: process.env.DB_URI,
  publicKey: process.env.PUBLIC_KEY,
  privateKey: process.env.PRIVATE_KEY,
  domain: process.env.DOMAIN || "localhost",
};

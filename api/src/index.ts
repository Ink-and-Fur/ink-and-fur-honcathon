import { clerkMiddleware, getAuth, Hono, load, neon } from "./deps.ts";
// import { logger, Mizu } from "./mizu.ts";
import * as AWS from "s3";

const env = await load();

const client = new AWS.S3({
  credentials: {
    accessKeyId: env.AWS_ACCESS_KEY,
    secretAccessKey: env.AWS_SECRET_ACCESS_KEY
  },
  region: "eu-central-1"
});

type Bindings = {
  DATABASE_URL: string;
  MIZU_ENDPOINT: string;
  AWS_S3_BUCKET: string;
};

const app = new Hono<{ Bindings: Bindings }>();

// Mizu Tracing Middleware - Must be called first!
// app.use(async (c, next) => {
//   const config = { MIZU_ENDPOINT: env.MIZU_ENDPOINT };
//   const ctx = c.executionCtx;

//   const teardown = Mizu.init(
//     config,
//     ctx,
//   );

//   await next();

//   teardown();
// });

// Mizu request logging
// app.use(logger());

app.use(
  "*",
  clerkMiddleware({
    secretKey: env.CLERK_SECRET_KEY,
    publishableKey: env.CLERK_PUBLISHABLE_KEY,
  }),
);

app.get("/no-db", async (c) => {
  const sql = neon(env.DATABASE_URL ?? "");

  return c.json({
    message: "Hello, world!",
  });
});

app.get("/s3", async (c) => {
  const data = await client.putObject({
    Bucket: env.AWS_S3_BUCKET,
    Key: "meow2.txt",
    Body: "hello"
  });

  console.log(data);

  return c.text('Hello Hono!')
})

app.get("/api/users", async (c) => {
  const sql = neon(env.DATABASE_URL);
  const users = await sql`select * from users`;
  return c.json({
    users,
  });
});

app.get("/", async (c) => {
  const clerkClient = c.get("clerk");

  const auth = getAuth(c);

  if (!auth?.userId) {
    return c.json({
      message: "You are not logged in.",
    });
  }

  try {
    const user = await clerkClient.users.getUser(auth.userId);

    return c.json({
      user,
    });
  } catch (e) {
    console.error(e);
    return c.json({
      message: "User not found.",
    }, 404);
  }
});

export default app;

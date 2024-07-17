import { clerkMiddleware, getAuth, Hono, load, neon, drizzle, eq, and } from "./deps.ts";
// import { logger, Mizu } from "./mizu.ts";
import * as AWS from "s3";
import {jobs} from "./db/schema.ts";

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

/*app.use(
  "*",
  clerkMiddleware({
    secretKey: env.CLERK_SECRET_KEY,
    publishableKey: env.CLERK_PUBLISHABLE_KEY,
  }),
);*/

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

app.get("/api/jobs", async (c) => {
  const db = drizzle(neon(env.DATABASE_URL));

  // todo replace this with actual auth later down the road
  let userId = 10;

  const allJobs = await db.select().from(jobs).where(eq(jobs.user, userId));

  return c.json({
    jobs: allJobs
  });
});

app.post("/api/jobs", async (c) => {
  const db = drizzle(neon(env.DATABASE_URL));

  // todo replace this with actual auth later down the road
  let userId = 10;

  // parses the request as multipart/form-data: https://hono.dev/examples/file-upload
  const body = await c.req.parseBody();

  const name = body["name"].toLowerCase(); // mby check that this is ascii only
  const file = body["file"]; // mby check that this is actually a .zip file

  const result = await db.select().from(jobs).where(and(
      eq(jobs.user, userId),
      eq(jobs.name, name),
  )).limit(1);

  if (result.length !== 0) {
    c.status(400);
    return c.json({
      error: "already_exists",
      description: "a pet with this name already exists for the current user"
    });
  }

  const fileName = `images_${userId}_${name}.zip`;

  await client.putObject({
    Bucket: env.AWS_S3_BUCKET,
    Key: fileName,
    Body: file
  });

  const url = `https://${env.AWS_S3_BUCKET}.s3.eu-central-1.amazonaws.com/${fileName}`;

  const result = await db.insert(jobs).values({
    user: userId,
    name: name,
    images: url
  }).returning();

  // now that all the stuff has been successfully uploaded and inserted into our db
  // it is time to start the job
  return c.json({
    success: true,
    job: result?.[0]
  });
});

/*app.get("/", async (c) => {
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
});*/

export default app;

import {
  and,
  clerkMiddleware,
  drizzle,
  eq,
  getAuth,
  Hono,
  load,
  neon,
  createHonoMiddleware
} from "./deps.ts";
import * as AWS from "s3";
import {jobs} from "./db/schema.ts";
import {
  PREDICTION_OUTPUT,
  PREDICTION_START,
  PREDICTION_COMPLETED,
  trainLora
} from "./replicate.ts";

const env = await load();

const client = new AWS.S3({
  credentials: {
    accessKeyId: env.AWS_ACCESS_KEY,
    secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
  },
  region: "eu-central-1",
});

type Bindings = {
  DATABASE_URL: string;
  MIZU_ENDPOINT: string;
  AWS_S3_BUCKET: string;
  BASE_URL: string;
};

const app = new Hono<{ Bindings: Bindings }>();

app.use(createHonoMiddleware(app));

// Clerk Auth Middleware - commented out
/*app.use(
  "*",
  clerkMiddleware({
    secretKey: env.CLERK_SECRET_KEY,
    publishableKey: env.CLERK_PUBLISHABLE_KEY,
  }),
);*/

app.get("/no-db", (c) => {
  const sql = neon(env.DATABASE_URL ?? "");

  return c.json({
    message: "Hello, world!",
  });
});

app.get("/s3", async (c) => {
  const data = await client.putObject({
    Bucket: env.AWS_S3_BUCKET,
    Key: "meow2.txt",
    Body: "hello",
  });

  console.log(data);

  return c.text("Hello Hono!");
});

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
  const userId = 10;

  const allJobs = await db.select().from(jobs).where(eq(jobs.user, userId));

  return c.json({
    jobs: allJobs,
  });
});

app.post("/api/jobs", async (c) => {
  const db = drizzle(neon(env.DATABASE_URL));

  // todo replace this with actual auth later down the road
  const userId = 10;

  // parses the request as multipart/form-data: https://hono.dev/examples/file-upload
  const body = await c.req.parseBody();

  const name = body["name"].toLowerCase(); // mby check that this is ascii only
  const file = body["file"]; // mby check that this is actually a .zip file

  // prevnet the name from containing a slash as this doesnt play nicely with our callback urls using path parameters
  if (name.includes("/")) {
    c.status(400);
    return c.json({
      error: "invalid_name",
      description: "the pet name cannot contain a slash",
    });
  }

  const result = await db.select().from(jobs).where(and(
    eq(jobs.user, userId),
    eq(jobs.name, name),
  )).limit(1);

  if (result.length !== 0) {
    c.status(400);
    return c.json({
      error: "already_exists",
      description: "a pet with this name already exists for the current user",
    });
  }

  const fileName = `images_${userId}_${name}.zip`;

  await client.putObject({
    Bucket: env.AWS_S3_BUCKET,
    Key: fileName,
    Body: file,
  });

  const url =
    `https://${env.AWS_S3_BUCKET}.s3.eu-central-1.amazonaws.com/${fileName}`;

  const createJobResult = await db.insert(jobs).values({
    user: userId,
    name: name,
    images: url,
  }).returning();

  // now that all the stuff has been successfully uploaded and inserted into our db
  // it is time to start the job
  const callbackUrl = `${env.BASE_URL}/api/jobs/${userId}/${name}/callback`;

  const { data, error } = await trainLora({
    inputImages: url,
    webhook: callbackUrl,
    webhookEventsFilter: [PREDICTION_START, PREDICTION_OUTPUT, PREDICTION_COMPLETED],
  });

  if (error !== null) {
    console.error(error);

    c.status(502);
    return c.json({
      error: "train_lora_failed",
      description: error.toString(),
    });
  }

  await db.update(jobs).set({
    last_update: data.status,
    updates: [data],
  }).where(and(
      eq(jobs.user, userId),
      eq(jobs.name, name),
  ));

  console.log("started job", data.id, ", set status in db to", data.status);

  return c.json({
    success: true,
    job: createJobResult?.[0],
  });
});

app.get("/api/jobs/:name", async (c) => {
  const db = drizzle(neon(env.DATABASE_URL));

  // todo replace this with actual auth later down the road
  const userId = 10;

  const name = c.req.param("name");

  const result = await db.select().from(jobs).where(and(
    eq(jobs.user, userId),
    eq(jobs.name, name),
  )).limit(1);

  if (result.length === 0) {
    c.status(404);
    return c.json({
      error: "not_found",
      description: "the pet does not exist",
    });
  }

  return c.json(result[0]);
});

app.post("/api/jobs/:userId/:name/callback", async (c) => {
  const { userId, name } = c.req.param();

  const body = await c.req.json();

  console.log(body);

  // put our code into a separate thingy so it doesnt immediately execute, allowing us to return early
  // and not make replicate wait (as it'll resend it very often if we dont respond fast)
  setTimeout(async () => {
    const db = drizzle(neon(env.DATABASE_URL));

    const result = await db.select().from(jobs).where(and(
        eq(jobs.user, userId),
        eq(jobs.name, name),
    )).limit(1);

    if (result.length !== 1) {
      console.warn("received replicate webhook for unknown job");
      return;
    }

    const status = body.status;

    const job = result[0];
    console.log("got  result now: ", job);
    job.updates.push(body);

    await db.update(jobs).set({
      last_update: status,
      updates: job.updates,
    }).where(and(
        eq(jobs.user, userId),
        eq(jobs.name, name),
    ));

    console.log("updated it even");


    if (status !== "succeeded") {
      return;
    }

    const weightsFileUrl = body.output;
    const response = await fetch(weightsFileUrl);
    const weightsFileBody = await response.arrayBuffer();

    const fileName = `weights_${userId}_${name}.tar`;

    await client.putObject({
      Bucket: env.AWS_S3_BUCKET,
      Key: fileName,
      Body: weightsFileBody,
    });

    const url = `https://${env.AWS_S3_BUCKET}.s3.eu-central-1.amazonaws.com/${fileName}`;

    await db.update(jobs).set({
      weights: url
    }).where(and(
        eq(jobs.user, userId),
        eq(jobs.name, name),
    ));

    console.log("received weights file!");

    // todo: notify the user somehow that its now completed?
  });

  return c.json({
    success: true
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

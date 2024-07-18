import {
  and,
  clerkMiddleware,
  drizzle,
  eq,
  getAuth,
  Hono,
  load,
  neon,
  createHonoMiddleware,
  serveStatic
} from "./deps.ts";
import * as AWS from "s3";
import {imageJobs, jobs} from "./db/schema.ts";
import {
  PREDICTION_OUTPUT,
  PREDICTION_START,
  PREDICTION_COMPLETED,
  trainLora, createImageWithLoraWeights
} from "./replicate.ts";

const env = await load({ export: true });

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
  FPX_ENDPOINT: string;
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
  const type = body["type"];

  if (type !== "cat" && type !== "dog")  {
    return c.json({
      error: "invalid_type",
      description: "type needs to be either cat or dog",
    }, 401);
  }

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
    type: type
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

  console.log("started job", data.id, "for", name, "(user id", userId, "), set status in db to", data.status);

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

  const images = await db.select().from(imageJobs).where(eq(imageJobs.name, name));

  return c.json({
    ...result[0],
    generatedImages: images,
  });
});

app.post("/api/jobs/:userId/:name/callback", async (c) => {
  const { userId, name } = c.req.param();
  const body = await c.req.json();

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
    job.updates.push(body);

    await db.update(jobs).set({
      last_update: status,
      updates: job.updates,
    }).where(and(
        eq(jobs.user, userId),
        eq(jobs.name, name),
    ));

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

    console.log("received weights file for", name, "(user id", userId, ")");
  });

  return c.json({
    success: true
  });
});

app.post("/api/generate", async (c) => {
  const db = drizzle(neon(env.DATABASE_URL));

  // todo replace this with actual auth later down the road
  const userId = 10;

  const request = await c.req.json();

  const name = request.name;
  const prompt = request.prompt;
  const negativePrompt = request.negativePrompt;

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

  const pet = result[0];
  const weights = pet.weights;

  if (weights === null) {
    c.status(401);
    return c.json({
      error: "weights_not_found",
      description: "start a training job first to create a weights file before trying to generate images",
    });
  }

  const createImageJobResult = await db.insert(imageJobs).values({
    user: userId,
    name: name,
    status: 'starting',
    options: {
      prompt,
      negativePrompt
    }
  }).returning();

  const actualResult = createImageJobResult[0];

  const callbackUrl = `${env.BASE_URL}/api/generate/${actualResult.id}/callback`;

  const { data, error } = await createImageWithLoraWeights(
    weights,
    prompt,
    callbackUrl,
    [PREDICTION_START, PREDICTION_OUTPUT, PREDICTION_COMPLETED],
      {
        negative_prompt: negativePrompt
      });

  if (error !== null) {
    console.error(error);

    return c.json({
      error: "create_image_with_lora_weights_failed",
      description: error.toString(),
    }, 502);
  }

  console.log(data);

  return c.json({
    success: true,
    job: actualResult,
  });
});

app.post("/api/generate/:id/callback", async (c) => {
  const { id } = c.req.param();

  const body = await c.req.json();

  console.log(body);

  // put our code into a separate thingy so it doesnt immediately execute, allowing us to return early
  // and not make replicate wait (as it'll resend it very often if we dont respond fast)
  setTimeout(async () => {
    const db = drizzle(neon(env.DATABASE_URL));

    const result = await db.select().from(imageJobs).where(eq(imageJobs.id, id)).limit(1);

    if (result.length !== 1) {
      console.warn("received replicate webhook for unknown job");
      return;
    }

    const job = result[0];

    const status = body.status;

    await db.update(imageJobs).set({
      status: status
    }).where(eq(imageJobs.id, id));

    if (status !== "succeeded") {
      console.log("received unsucceeded update");
      return;
    }

    const urls = body.output;
    let outputUrls = [];

    for (const value of urls) {
      const index = urls.indexOf(value);

      const response = await fetch(value);
      const imageBody = await response.arrayBuffer();

      const fileName = `image_${id}_${index}_${job.user}_${job.name}.png`;

      await client.putObject({
        Bucket: env.AWS_S3_BUCKET,
        Key: fileName,
        Body: imageBody,
      });

      const url = `https://${env.AWS_S3_BUCKET}.s3.eu-central-1.amazonaws.com/${fileName}`;
      outputUrls.push(url);
    }

    await db.update(imageJobs).set({
      images: outputUrls
    }).where(eq(imageJobs.id, id));

    console.log("received images for job", id);
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

app.use("/*", serveStatic({ root: "./public" }));

export default app;

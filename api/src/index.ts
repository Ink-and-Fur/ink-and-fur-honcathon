import { Hono } from 'hono'
import { clerkMiddleware, getAuth } from '@hono/clerk-auth'
import { Mizu, logger } from "./mizu";

type Bindings = {
  MIZU_ENDPOINT: string;
};

const app = new Hono<{ Bindings: Bindings }>();

// Mizu Tracing Middleware - Must be called first!
app.use(async (c, next) => {
  const config = { MIZU_ENDPOINT: c.env.MIZU_ENDPOINT };
  const ctx = c.executionCtx;

  const teardown = Mizu.init(
    config,
    ctx,
  );

  await next();

  teardown();
});

// Mizu request logging
app.use(logger());

app.use('*', clerkMiddleware())

app.get('/', async (c) => {
  const clerkClient = c.get('clerk')

  const auth = getAuth(c)

  if (!auth?.userId) {
    return c.json({
      message: 'You are not logged in.',
    })
  }

  try {
    const user = await clerkClient.users.getUser('user_id_....')

    return c.json({
      user,
    })
  } catch (e) {
    console.error(e);
    return c.json({
      message: 'User not found.'
    }, 404)
  }
})

export default app

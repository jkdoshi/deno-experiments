import {
  Application,
  Context,
  Router,
} from "https://deno.land/x/oak@v6.5.0/mod.ts";

import {
  bold,
  green,
  underline,
  yellow,
} from "https://deno.land/std/fmt/colors.ts";

const app = new Application();

// logger
app.use(async (ctx: Context, next: () => Promise<void>) => {
  await next();
  const rt = ctx.response.headers.get("X-Response-Time");
  console.log(ctx.request.method, ctx.request.url.pathname, rt);
});

// timer
app.use(async (ctx: Context, next: () => Promise<void>) => {
  const start = Date.now();
  await next();
  const ms = Date.now() - start;
  ctx.response.headers.set("X-Response-Time", `${ms}ms`);
});

// router
const router = new Router();
router.get("/hello", (ctx) => {
  ctx.response.body = `Hello there!`; // string
});
router.get("/hello/:name", (ctx) => {
  const { name = "Stranger" } = ctx.params;
  ctx.response.body = { message: `Hello ${name}!` }; // json
});
app.use(router.routes());
app.use(router.allowedMethods());

// static file server (should be after others in the "use" chain)
app.use(async (ctx, next) => {
  await ctx.send({ root: "./public", index: "index.html" });
});

// listener on start
app.addEventListener("listen", ({ hostname, port, secure }) => {
  const url = `${secure ? "https://" : "http://"}${hostname ??
    "localhost"}:${port}`;
  console.log(
    yellow(
      `Listening at ${green(bold(underline(url)))}`,
    ),
  );
});

await app.listen({ port: 8080 });

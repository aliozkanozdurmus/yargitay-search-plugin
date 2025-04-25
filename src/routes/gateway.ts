import { Hono } from "hono";
import { createGatewayOnEdgeRuntime } from "@lobehub/chat-plugins-gateway";

import type { Bindings } from "..";

export const gateway = new Hono<{ Bindings: Bindings }>()
  .get("/", (c) =>
    c.json(
      { message: "GET /api/gateway is not supported, use POST instead" },
      405,
    ),
  )
  .post("/", async (c) => createGatewayOnEdgeRuntime()(c.req.raw)); 
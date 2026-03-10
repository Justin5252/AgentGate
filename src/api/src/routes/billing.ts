import type { FastifyInstance } from "fastify";
import type {
  CreateCheckoutRequest,
  BillingPortalRequest,
  ApiResponse,
  BillingPlan,
  Subscription,
} from "@agentgate/shared";
import { ErrorCodes } from "@agentgate/shared";

export async function billingRoutes(server: FastifyInstance) {
  // GET /plans — List available billing plans (public)
  server.get("/plans", async (_request, reply) => {
    const start = performance.now();
    const requestId = crypto.randomUUID();

    const plans = server.billingService.getPlans();

    const response: ApiResponse<BillingPlan[]> = {
      data: plans,
      error: null,
      meta: { requestId, durationMs: performance.now() - start },
    };
    return reply.send(response);
  });

  // POST /checkout — Create Stripe checkout session
  server.post("/checkout", async (request, reply) => {
    const start = performance.now();
    const requestId = crypto.randomUUID();

    try {
      const body = request.body as CreateCheckoutRequest;

      if (!body.tenantId || !body.plan || !body.successUrl || !body.cancelUrl) {
        const response: ApiResponse<null> = {
          data: null,
          error: {
            code: ErrorCodes.VALIDATION_ERROR,
            message: "Missing required fields: tenantId, plan, successUrl, cancelUrl",
          },
          meta: { requestId, durationMs: performance.now() - start },
        };
        return reply.status(400).send(response);
      }

      const result = await server.billingService.createCheckout(
        body.tenantId,
        body.plan,
        body.interval || "monthly",
        body.successUrl,
        body.cancelUrl,
      );

      const response: ApiResponse<{ url: string | null; message?: string }> = {
        data: result,
        error: null,
        meta: { requestId, durationMs: performance.now() - start },
      };
      return reply.send(response);
    } catch (err) {
      const response: ApiResponse<null> = {
        data: null,
        error: {
          code: ErrorCodes.INTERNAL_ERROR,
          message: err instanceof Error ? err.message : "Failed to create checkout session",
        },
        meta: { requestId, durationMs: performance.now() - start },
      };
      return reply.status(500).send(response);
    }
  });

  // POST /portal — Create Stripe billing portal session
  server.post("/portal", async (request, reply) => {
    const start = performance.now();
    const requestId = crypto.randomUUID();

    try {
      const body = request.body as BillingPortalRequest;

      if (!body.tenantId || !body.returnUrl) {
        const response: ApiResponse<null> = {
          data: null,
          error: {
            code: ErrorCodes.VALIDATION_ERROR,
            message: "Missing required fields: tenantId, returnUrl",
          },
          meta: { requestId, durationMs: performance.now() - start },
        };
        return reply.status(400).send(response);
      }

      const result = await server.billingService.createBillingPortal(
        body.tenantId,
        body.returnUrl,
      );

      const response: ApiResponse<{ url: string | null; message?: string }> = {
        data: result,
        error: null,
        meta: { requestId, durationMs: performance.now() - start },
      };
      return reply.send(response);
    } catch (err) {
      const response: ApiResponse<null> = {
        data: null,
        error: {
          code: ErrorCodes.INTERNAL_ERROR,
          message: err instanceof Error ? err.message : "Failed to create billing portal session",
        },
        meta: { requestId, durationMs: performance.now() - start },
      };
      return reply.status(500).send(response);
    }
  });

  // GET /subscription/:tenantId — Get subscription details
  server.get<{ Params: { tenantId: string } }>(
    "/subscription/:tenantId",
    async (request, reply) => {
      const start = performance.now();
      const requestId = crypto.randomUUID();

      try {
        const { tenantId } = request.params;
        const subscription = await server.billingService.getSubscription(tenantId);

        const response: ApiResponse<Subscription | null> = {
          data: subscription,
          error: null,
          meta: { requestId, durationMs: performance.now() - start },
        };
        return reply.send(response);
      } catch (err) {
        const response: ApiResponse<null> = {
          data: null,
          error: {
            code: ErrorCodes.INTERNAL_ERROR,
            message: err instanceof Error ? err.message : "Failed to fetch subscription",
          },
          meta: { requestId, durationMs: performance.now() - start },
        };
        return reply.status(500).send(response);
      }
    },
  );

  // POST /cancel/:tenantId — Cancel subscription at period end
  server.post<{ Params: { tenantId: string } }>(
    "/cancel/:tenantId",
    async (request, reply) => {
      const start = performance.now();
      const requestId = crypto.randomUUID();

      try {
        const { tenantId } = request.params;
        await server.billingService.cancelSubscription(tenantId);

        const response: ApiResponse<{ canceled: boolean }> = {
          data: { canceled: true },
          error: null,
          meta: { requestId, durationMs: performance.now() - start },
        };
        return reply.send(response);
      } catch (err) {
        const response: ApiResponse<null> = {
          data: null,
          error: {
            code: ErrorCodes.INTERNAL_ERROR,
            message: err instanceof Error ? err.message : "Failed to cancel subscription",
          },
          meta: { requestId, durationMs: performance.now() - start },
        };
        return reply.status(500).send(response);
      }
    },
  );

  // POST /webhook — Stripe webhook handler
  server.post(
    "/webhook",
    {
      config: { rawBody: true },
    },
    async (request, reply) => {
      try {
        const signature = request.headers["stripe-signature"] as string;
        if (!signature) {
          return reply.status(400).send({ error: "Missing stripe-signature header" });
        }

        // Fastify raw body — use rawBody if available, otherwise fall back to body
        const rawBody =
          (request as unknown as { rawBody?: string | Buffer }).rawBody ??
          (typeof request.body === "string" ? request.body : JSON.stringify(request.body));

        const payload = typeof rawBody === "string" ? rawBody : rawBody.toString();

        await server.billingService.handleWebhook(payload, signature);

        return reply.status(200).send({ received: true });
      } catch (err) {
        server.log.error(err, "Stripe webhook error");
        return reply.status(400).send({
          error: err instanceof Error ? err.message : "Webhook processing failed",
        });
      }
    },
  );
}

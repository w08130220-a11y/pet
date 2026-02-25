import { z } from "zod";
import { COOKIE_NAME } from "../shared/const.js";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { chatWithPet, getAutonomousBehavior } from "./ai-pet-chat";

export const appRouter = router({
  // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // AI Pet Chat (Premium Feature)
  petAI: router({
    chat: publicProcedure
      .input(
        z.object({
          petInfo: z.object({
            name: z.string(),
            species: z.string(),
            breed: z.string().optional(),
            age: z.number().optional(),
            weight: z.number().optional(),
          }),
          message: z.string().min(1).max(500),
          conversationHistory: z
            .array(
              z.object({
                role: z.enum(["user", "assistant"]),
                content: z.string(),
              })
            )
            .optional()
            .default([]),
        })
      )
      .mutation(async ({ input }) => {
        const response = await chatWithPet(
          input.petInfo,
          input.message,
          input.conversationHistory
        );
        return response;
      }),

    autonomousBehavior: publicProcedure
      .input(
        z.object({
          petInfo: z.object({
            name: z.string(),
            species: z.string(),
            breed: z.string().optional(),
          }),
          currentTime: z.string(),
          recentActivity: z.array(z.string()).optional().default([]),
        })
      )
      .mutation(async ({ input }) => {
        const behavior = await getAutonomousBehavior(
          input.petInfo,
          input.currentTime,
          input.recentActivity
        );
        return behavior;
      }),
  }),
});

export type AppRouter = typeof appRouter;

import { z } from "zod";
import { COOKIE_NAME } from "../shared/const.js";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";

export const appRouter = router({
  system: systemRouter,

  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  // Provider search
  providers: router({
    list: publicProcedure
      .input(
        z.object({
          category: z.enum(['nail', 'hair', 'massage', 'lash', 'spa', 'tattoo']).optional(),
          city: z.string().optional(),
          query: z.string().optional(),
        }).optional()
      )
      .query(({ input }) => {
        // In production, this would query the database
        return { providers: [], total: 0 };
      }),

    getById: publicProcedure
      .input(z.object({ id: z.string() }))
      .query(({ input }) => {
        return null;
      }),
  }),

  // Booking management
  bookings: router({
    create: publicProcedure
      .input(
        z.object({
          providerId: z.string(),
          serviceId: z.string(),
          staffId: z.string(),
          date: z.string(),
          time: z.string(),
          note: z.string().optional().default(''),
        })
      )
      .mutation(({ input }) => {
        return { success: true, bookingId: `b-${Date.now()}` };
      }),

    cancel: publicProcedure
      .input(z.object({ bookingId: z.string() }))
      .mutation(({ input }) => {
        return { success: true };
      }),

    list: publicProcedure.query(() => {
      return { bookings: [] };
    }),
  }),

  // Review management
  reviews: router({
    create: publicProcedure
      .input(
        z.object({
          bookingId: z.string(),
          providerId: z.string(),
          rating: z.number().min(1).max(5),
          comment: z.string().max(500),
        })
      )
      .mutation(({ input }) => {
        return { success: true };
      }),

    listByProvider: publicProcedure
      .input(z.object({ providerId: z.string() }))
      .query(({ input }) => {
        return { reviews: [] };
      }),
  }),
});

export type AppRouter = typeof appRouter;

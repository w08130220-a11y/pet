import { createTRPCReact } from "@trpc/react-query";
import { httpBatchLink } from "@trpc/client";
import superjson from "superjson";
import type { AppRouter } from "@/server/routers";

export const trpc = createTRPCReact<AppRouter>();

const getBaseUrl = () => {
  // In production, this should be your API server URL
  // For development, use the local server
  return "http://localhost:3000/api/trpc";
};

export function getTRPCClient() {
  return trpc.createClient({
    links: [
      httpBatchLink({
        url: getBaseUrl(),
        transformer: superjson,
      }),
    ],
  });
}

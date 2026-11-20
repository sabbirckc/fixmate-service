import { createAuthClient } from "better-auth/react"
import { jwtClient } from "better-auth/client/plugins"

const getClientBaseURL = () => {
  if (typeof window !== "undefined") {
    return window.location.origin;
  }
  return process.env.NEXT_PUBLIC_BETTER_AUTH_URL || "https://fixmate-service.vercel.app";
};

export const authClient = createAuthClient({
  baseURL: getClientBaseURL(),
  plugins: [jwtClient()],
  sessionOptions: {
    refetchOnWindowFocus: false,
  },
})

export const { signIn, signUp, signOut, useSession } = authClient

import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { jwt } from "better-auth/plugins";
import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI || "";
const client = new MongoClient(uri);
const db = client.db("fixmate-service");

export const auth = betterAuth({
  baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL || "http://localhost:3000",
  database: mongodbAdapter(db),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    },
  },
  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          return {
            data: {
              ...user,
              role: (user as any).role || "customer",
            },
          };
        },
      },
    },
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: false,
        defaultValue: "customer",
        input: true,
      },
      phone: {
        type: "string",
        required: false,
        defaultValue: "",
        input: true,
      },
      area: {
        type: "string",
        required: false,
        defaultValue: "",
        input: true,
      },
      bio: {
        type: "string",
        required: false,
        defaultValue: "",
        input: true,
      },
    },
  },
  trustedOrigins: [
    "http://localhost:3000",
    "http://localhost:5000",
    "https://fixmate-service.vercel.app",
    process.env.NEXT_PUBLIC_BETTER_AUTH_URL,
    process.env.CLIENT_URL,
  ].filter(Boolean) as string[],
  plugins: [
    jwt({
      jwt: {
        definePayload: (session) => ({
          id: session.user.id,
          email: session.user.email,
          name: session.user.name,
          image: session.user.image || "",
          role: (session.user as any).role || "customer",
          phone: (session.user as any).phone || "",
          area: (session.user as any).area || "",
          bio: (session.user as any).bio || "",
        }),
      },
    }),
  ],
});

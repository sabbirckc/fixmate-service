import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { jwt } from "better-auth/plugins";
import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI || "";
const client = new MongoClient(uri);
const db = client.db("fixmate-service");

interface CustomUserData {
  role?: string;
  phone?: string;
  area?: string;
  bio?: string;
}

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
          const custom = user as unknown as CustomUserData;
          return {
            data: {
              ...user,
              // Admin cannot be signed up; validate and enforce customer or technician
              role: custom.role === "technician" ? "technician" : "customer",
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
    process.env.NEXT_PUBLIC_SERVER_URL,
    "https://fixmate-service.vercel.app",
    process.env.NEXT_PUBLIC_BETTER_AUTH_URL,
    process.env.CLIENT_URL,
  ].filter(Boolean) as string[],
  plugins: [
    jwt({
      jwt: {
        definePayload: (session) => {
          const user = session.user as unknown as CustomUserData;
          return {
            id: session.user.id,
            email: session.user.email,
            name: session.user.name,
            image: session.user.image || "",
            role: user.role || "customer",
            phone: user.phone || "",
            area: user.area || "",
            bio: user.bio || "",
          };
        },
      },
    }),
  ],
});

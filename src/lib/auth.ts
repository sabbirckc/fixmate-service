import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { jwt } from "better-auth/plugins";
import { MongoClient, Db } from "mongodb";

declare global {
  var _mongoClient: MongoClient | undefined;
}

function getMongoClient(): MongoClient {
  const uri = process.env.MONGODB_URI || "";
  const existingClient = globalThis._mongoClient as any;
  if (!existingClient || existingClient.topology?.isDestroyed()) {
    globalThis._mongoClient = new MongoClient(uri, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 15000,
      socketTimeoutMS: 45000,
    });
  }
  return globalThis._mongoClient!;
}

const dbProxy = new Proxy({} as Db, {
  get(_target, prop) {
    const client = getMongoClient();
    const db = client.db("fixmate-service");
    const val = (db as any)[prop];
    return typeof val === "function" ? val.bind(db) : val;
  },
});

interface CustomUserData {
  role?: string;
  phone?: string;
  area?: string;
  bio?: string;
}

const getBaseURL = () => {
  if (process.env.BETTER_AUTH_URL) return process.env.BETTER_AUTH_URL;
  if (process.env.NEXT_PUBLIC_BETTER_AUTH_URL && !process.env.NEXT_PUBLIC_BETTER_AUTH_URL.includes("localhost")) {
    return process.env.NEXT_PUBLIC_BETTER_AUTH_URL;
  }
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  if (process.env.NODE_ENV === "production") {
    return "https://fixmate-service.vercel.app";
  }
  return process.env.NEXT_PUBLIC_BETTER_AUTH_URL || "http://localhost:3000";
};

export const auth = betterAuth({
  baseURL: getBaseURL(),
  secret: process.env.BETTER_AUTH_SECRET,
  database: mongodbAdapter(dbProxy, { transaction: false }),
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
    "https://fixmate-service.vercel.app",
    "https://*.vercel.app",
    "https://fixmate-service-server.vercel.app",
    process.env.NEXT_PUBLIC_SERVER_URL,
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

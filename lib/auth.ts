import { NextAuthOptions } from "next-auth";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import GoogleProvider from "next-auth/providers/google";
import GithubProvider from "next-auth/providers/github";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare, hash } from "bcrypt";
import clientPromise from "./mongodb";
import { getUserByEmail, createUser } from "./db";

export const authOptions: NextAuthOptions = {
  adapter: MongoDBAdapter(clientPromise),
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID as string,
      clientSecret: process.env.GITHUB_SECRET as string,
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
    CredentialsProvider({
      id: "credentials",
      name: "Email & Password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        isRegister: { label: "Is Register", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required");
        }
        
        const isRegister = credentials.isRegister === "true";
        const { email, password } = credentials;

        try {
          // Check if user exists
          const existingUser = await getUserByEmail(email);

          // Registration flow
          if (isRegister) {
            if (existingUser) {
              throw new Error("User with this email already exists");
            }
            
            // Create a new user with the provided email and password
            const hashedPassword = await hash(password, 10);
            
            const newUser = await createUser({
              email,
              password: hashedPassword,
              name: email.split('@')[0], // Use part of email as initial name
              emailVerified: new Date(), // Mark as verified since we're not doing email verification
            });
            
            return {
              id: newUser._id.toString(),
              email: newUser.email,
              name: newUser.name || '',
              image: newUser.image || null,
            };
          }
          // Login flow
          else {
            if (!existingUser) {
              throw new Error("No user found with this email");
            }
            
            // Verify password - only for users created with credentials
            if (!existingUser.password) {
              throw new Error("Please sign in with the provider you used to create your account");
            }
            
            const passwordMatch = await compare(password, existingUser.password);
            if (!passwordMatch) {
              throw new Error("Invalid password");
            }
            
            return {
              id: existingUser._id.toString(),
              email: existingUser.email,
              name: existingUser.name || '',
              image: existingUser.image || null,
            };
          }
        } catch (error: any) {
          console.error("Auth error:", error);
          throw new Error(error.message || "Authentication failed");
        }
      },
    }),
  ],
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  session: {
    strategy: "jwt",
  },
  debug: process.env.NODE_ENV === "development",
  callbacks: {
    session: async ({ session, token }) => {
      if (token) {
        session.user.id = token.id as string;
        session.user.name = token.name;
        session.user.email = token.email;
        session.user.image = token.picture;
      }
      return session;
    },
    jwt: async ({ token, user }) => {
      // Find the user in the database
      if (user) {
        token.id = user.id;
      }
      return token;
    },
  },
}; 
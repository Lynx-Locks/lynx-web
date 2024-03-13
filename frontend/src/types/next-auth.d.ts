import { DefaultSession, DefaultUser } from "next-auth";
import { JWT, DefaultJWT } from "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      isAdmin: boolean;
      email: string;
      name: string;
      timeIn: string;
      lastDateIn: string;
    } & DefaultSession;
  }

  interface User extends DefaultUser {
    isAdmin: boolean;
    email: string;
    name: string;
    timeIn: string;
    lastDateIn: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    isAdmin: boolean;
    email: string;
    name: string;
  }
}

import type {NextAuthOptions} from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import axios from "@/axios/client";
import { PublicKeyCredentialRequestOptionsJSON } from "@simplewebauthn/types";
import { startAuthentication } from "@simplewebauthn/browser";

export const options: NextAuthOptions = {
	providers: [
		CredentialsProvider({
			id: 'login',
			name: "Credentials",
			credentials: {
				email: {
					label: "Email",
					type: "text",
				},
			},
			async authorize(credentials, _req) {
				const userResp = await axios.get("/users/login", {
					params: {
						email: credentials?.email,
					},
				});
				const user = userResp.data;
				return user;
			}
		}
		)
	],
	pages: {
		signIn: "/login",
		signOut: "/login",
	},
	callbacks: {
		async jwt({ token, user }) {
			if (user) {
				token.isAdmin = user.isAdmin;
			}
			return token;
		},
		async session({ session, token }) {
			if (session?.user) {
				session.user.isAdmin = token.isAdmin;
			}
			return session
		}
	}
}
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
				const userResp = await axios.get("/users", {
					params: {
						email: credentials?.email,
					},
				});
	
				return userResp.data;
				// try {
				// 	const user = userResp.data;
				// 	const response = await axios.post(`/login/request/${user.id}`);
				// 	const options: PublicKeyCredentialRequestOptionsJSON = response.data;
				// 	// Prompt user to user passkey
				// 	const credential = await startAuthentication(options);
				// 	// verify the credential
				// 	const verifyResp = await axios.post(`/login/${user.id}`, {
				// 		...credential,
				// 		challenge: options.challenge,
				// 	});
		
				// 	if (verifyResp.status === 200) {
				// 		return user;
				// 	} else {
				// 		throw new Error("Error validating credentials. Please try again.");
				// 	}
				// } catch (error) {
				// 	console.error("Login error: ", error);
				// }
				// return null;
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
import { withAuth, NextRequestWithAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
// export { default } from "next-auth/middleware";

export const config = { matcher: ["/", "/admin"] }

export default withAuth(
	function middleware(request: NextRequestWithAuth) {
		console.log(request.nextUrl.pathname);
		console.log(request.nextauth.token);

		debugger;

		if (request.nextUrl.pathname.startsWith("/admin") && !request.nextauth.token?.isAdmin) {
			return NextResponse.rewrite(new URL("/denied", request.url));
		}
	},
	{ 
	callbacks: {
		authorized: ({ token }) => !!token,
	},
	pages: {
		signIn: "/login",
		signOut: "/login",
	},
	} 
)

// 	{
//   // Must match with /api/auth/[...nextauth]/options.ts
//   pages: {
//     signIn: '/login',
//     signOut: '/login',
//   }
// })
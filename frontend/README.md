This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Environment Variables

For environment variables to work in production, you must do the following:

1. Call the environment variable with the prefix `NEXT_PUBLIC_` in the frontend (**all frontend calls must do this**).
2. Add the following line to the [Dockerfile](../Dockerfile) in the `builder` stage:
   ```dockerfile
   # replace [your_var] with the name of your environment variable
   ARG NEXT_PUBLIC_[your_var]=BAKED_[your_var]
   ```
3. Add the environment variable name (**without the `NEXT_PUBLIC_` prefix**) and its default value in the `allVars`
   variable located in the init function of [server.go](../backend/server.go).
4. Run the production container with your environment variable (**without the `NEXT_PUBLIC_` prefix**).

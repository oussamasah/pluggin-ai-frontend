This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

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

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Clerk configuration

This workspace now relies on [Clerk](https://clerk.com) for authentication, organization creation, and invitation workflows. Add the following variables to your `.env.local` (or the environment of your choice) before running `npm run dev`:

```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxx
CLERK_SECRET_KEY=sk_test_xxx
CLERK_SIGNING_SECRET=whsec_xxx # only required if you add Clerk webhooks
```

Restart the dev server so Next.js can pick up the new environment variables.

## Workspace & plan management

- Visit `/organizations` to create organizations mapped to the Starter, Growth, or Scale plans defined in `src/lib/constants.ts`.
- Each organization stores its plan metadata inside Clerk `publicMetadata`, which is enforced by the API routes located under `src/app/api/organizations`.
- Inviting members via the UI (or directly hitting `POST /api/organizations/:id/invite`) will block the request when it would exceed the selected plan's seat limit.
- Use the organization switcher in the left sidebar to activate an existing workspace, create new ones, or jump between teams.

## Route protection

The Clerk middleware now forces authentication across every route in the app. Unauthenticated visitors are automatically redirected to `/sign-in`, while `/sign-up` stays public so new teammates can register.

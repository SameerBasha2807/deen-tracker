
This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

## Firebase setup

This app now uses Firebase Authentication and Cloud Firestore for personal data. To enable it:

1. Create a project in the [Firebase console](https://console.firebase.google.com/), add a **Web app**, and enable **Authentication → Email/Password** and **Firestore Database**.
2. Copy `.env.example` to `.env.local` and replace every placeholder with the Web app configuration Firebase gives you. Do not commit `.env.local`.
3. In Firestore → Rules, publish the contents of `firestore.rules`. These rules ensure each signed-in user can only read and write their own data.
4. Restart `npm run dev`, then visit `/auth` to create an account. The Charity dashboard will persist data in `users/{uid}/charity`.

The older `app/api/**/routes.ts` files are not active Next.js route handlers (the required filename is `route.ts`) and are not used by the secure Firestore integration.

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

# deen-tracker

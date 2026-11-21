# Digital Banking Management System

Simulated digital banking app built as a single Next.js (App Router, TypeScript) project serving both frontend and backend via Route Handlers.

## Stack

- Next.js 16 (App Router, TypeScript)
- Tailwind CSS
- PostgreSQL on Neon via Prisma
- NextAuth (credentials, JWT sessions)
- Zod, bcryptjs
- Redux Toolkit + RTK Query
- Recharts

## Roles

ADMIN, STAFF, CUSTOMER.

## Setup

1. `npm install`
2. Copy `.env.example` to `.env` and fill Neon URLs + secrets
3. `npx prisma generate`
4. `npx prisma migrate dev`
5. `npm run dev`

## Structure

```
src/
  app/            # Next.js routes & layouts
  features/       # feature-based modules (api, components, slice, schemas, service)
  lib/            # prisma, auth, errors, api-response
prisma/
  schema.prisma
```

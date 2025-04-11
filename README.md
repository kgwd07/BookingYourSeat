# BookingYourSeat

A web application built with Next.js, Supabase (PostgreSQL), and Clerk authentication for managing seat reservations.

## Prerequisites

Before you begin, ensure you have the following installed:

- [Node.js](https://nodejs.org/) (v18 or later recommended)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/) or [pnpm](https://pnpm.io/)
- [Git](https://git-scm.com/)

## Environment Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/kgwd07/BookingYourSeat.git
   cd BookingYourSeat
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. Create a `.env.local` file in the root directory with the following variables:

   ```
   # Clerk Authentication
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
   CLERK_SECRET_KEY=your_clerk_secret_key
   ```

4. Create a `.env` file in the root directory with the following variables:
  
   ```
   # Supabase
   DATABASE_URL=your_database_url
   DIRECT_URL=your_direct_url
   ```

## Supabase Setup

1. Create a Supabase project at [https://app.supabase.io/](https://app.supabase.io/)
2. After creating your project, navigate to Settings > API to get your Database URL and Direct URL
3. Set up your database schema:
   - Go to the SQL Editor in your Supabase dashboard
   - Create your tables, functions, and policies for seat booking functionality
   - Alternatively, use the migration scripts if provided in the project

## Clerk Setup

1. Create a Clerk application at [https://dashboard.clerk.dev/](https://dashboard.clerk.dev/)
2. Configure your application settings:
   - Set up sign-in/sign-up methods
   - Customize branding if needed
   - Configure redirect URLs
3. Obtain your API keys from the Clerk dashboard

## Running the Application Locally

1. Start the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

2. Open [http://localhost:3000](http://localhost:3000) in your browser to view the application

## Project Features

- User authentication via Clerk
- Seat reservation system
- PostgreSQL database for data storage
- Responsive user interface

## Project Structure

```
/
├── app/                  # Next.js application routes
├── components/           # React components
├── lib/                  # Utility functions and shared code
├── public/               # Static assets
├── prisma/               # Database schema and migrations
├── middleware.ts         # Next.js middleware for Clerk
├── .env                  # Database environment variables
├── .env.local            # Clerk environment variables (not in repository)
└── README.md             # This file
```

## Additional Commands

```bash
# Build the application for production
npm run build
# or
yarn build
# or
pnpm build

# Start the production server
npm start
# or
yarn start
# or
pnpm start

# Run Prisma migrations
npx prisma migrate dev
```

## Troubleshooting

### Common Issues

1. **Authentication Error**: Ensure your Clerk API keys are correct and environment variables are properly set
2. **Database Connection Issues**: Verify your Supabase DATABASE_URL and DIRECT_URL are correct
3. **Missing Environment Variables**: Check that both `.env` and `.env.local` files are properly configured

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.io/docs)
- [Clerk Documentation](https://clerk.dev/docs)
- [Prisma Documentation](https://www.prisma.io/docs)

## License

[MIT](LICENSE)
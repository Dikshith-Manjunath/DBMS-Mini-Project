# DBMS Mini Project

This is a [Next.js](https://nextjs.org) project designed as a database management system (DBMS) mini-project. It provides a user-friendly interface for managing and analyzing data, with features like authentication, querying, and data visualization.

## Features

- **Authentication**: Sign up, sign in, and logout functionality with secure password hashing.
- **Dashboard**: A central hub displaying key metrics, quick actions, and recent activity.
- **Database Management**: View and manage database tables with pagination and table selection.
- **Query Execution**: Run SQL queries and view results directly in the application.
- **Responsive Design**: Fully responsive UI for both desktop and mobile devices.

## Getting Started

First, clone the repository and install dependencies:

```bash
git clone <repository-url>
cd DBMS-Mini-Project
npm install
```

Then, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## Project Structure

- **`/src/app`**: Contains the main application pages and API routes.
  - **`/dashboard`**: Dashboard page showing key metrics and quick actions.
  - **`/database`**: Page for viewing and managing database tables.
  - **`/signin`**: Sign-in page for user authentication.
  - **`/signup`**: Sign-up page for new user registration.
- **`/src/lib`**: Contains utility files like database connection and schema setup.
- **`/src/components`**: Reusable UI components like Header, Footer, and Navigation.

## Database Setup

This project uses PostgreSQL as the database. To set up the database:

1. Create a PostgreSQL database and update the `.env` file with your database credentials:

```env
POSTGRES_USER=your_username
POSTGRES_PASSWORD=your_password
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DATABASE=your_database_name
```

2. Run the SQL scripts in `/src/lib` to create the necessary tables:

```bash
psql -U your_username -d your_database_name -f src/lib/users-schema.sql
```

## API Endpoints

- **`/api/auth/signup`**: Handles user registration.
- **`/api/auth/signin`**: Handles user login.
- **`/api/tables`**: Fetches data from database tables with pagination.
- **`/api/setup/users`**: Initializes the `users` table.

## Deployment

The easiest way to deploy this Next.js app is to use the [Vercel Platform](https://vercel.com/). Check out the [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

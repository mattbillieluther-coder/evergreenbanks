# Evergreen Banking Web Application

A full-stack banking web application with dynamic branding, setup wizard, and admin dashboard.

## Features

- **Setup Wizard**: First-time configuration for database credentials, admin account, and branding
- **Dynamic Branding**: All branding elements (name, email, address, phone) can be customized
- **Admin Dashboard**: Manage users, settings, and branding
- **Secure Sessions**: Configurable session timeout with automatic logout on inactivity
- **PostgreSQL Database**: Robust data storage with migration support

## Prerequisites

- Node.js (v14+)
- PostgreSQL (v12+)
- npm or yarn

## Installation

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Copy `.env.example` to `.env` and configure your environment variables:
   ```
   cp .env.example .env
   ```
4. Edit the `.env` file with your PostgreSQL credentials and other settings

## Database Setup

The application includes a migration script to set up the database schema:

```
npm run migrate
```

This will create the necessary tables:
- `settings`: Application configuration and branding
- `users`: User accounts including admin users
- `sessions`: Active user sessions
- `notifications`: System notifications

## Running the Application

### Development Mode

To run both the client and server in development mode:

```
npm run dev
```

To run only the server:

```
npm run server
```

To run only the client:

```
npm run client
```

### Production Mode

Build the client:

```
npm run build
```

Start the production server:

```
npm start
```

## First-Time Setup

When you first run the application, you'll be guided through a setup wizard that will:

1. Verify database connection
2. Create an admin account
3. Configure bank branding (name, support email, address, phone)

After completing the setup, you'll be redirected to the login page.

## Session Security

- Users remain logged in while active
- Configurable session timeout (default: 15 minutes)
- Immediate logout on button press
- Sessions persist across page refreshes

## Project Structure

```
evergreen-bank/
├── client/               # React frontend
│   ├── public/           # Static assets
│   └── src/              # React source code
│       ├── components/   # Reusable components
│       ├── contexts/     # React contexts
│       ├── layouts/      # Page layouts
│       └── pages/        # Application pages
├── server/               # Node.js backend
│   ├── db/               # Database scripts
│   ├── middleware/       # Express middleware
│   └── routes/           # API routes
└── .env.example          # Environment variables template
```

## License

[MIT](LICENSE)
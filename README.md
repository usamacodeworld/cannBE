# Node.js TypeScript Authentication API

A modern Node.js API with TypeScript and user authentication.

## Features

- TypeScript support
- User authentication with JWT
- MongoDB database integration
- Password hashing with bcrypt
- Express.js framework
- CORS enabled
- Environment configuration

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or remote instance)
- npm or yarn

## Installation

1. Clone the repository
2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory with the following variables:
```
PORT=3000
MONGODB_URI=mongodb://localhost:27017/cannbe
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d
```

## Running the Application

Development mode:
```bash
npm run dev
```

Production build:
```bash
npm run build
npm start
```

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
  - Body: `{ "email": "user@example.com", "password": "password123", "name": "John Doe" }`

- `POST /api/auth/login` - Login user
  - Body: `{ "email": "user@example.com", "password": "password123" }`

## Project Structure

```
src/
  ├── controllers/    # Route controllers
  ├── models/        # Database models
  ├── routes/        # API routes
  ├── middleware/    # Custom middleware
  └── index.ts       # Application entry point
```

## Security Features

- Password hashing using bcrypt
- JWT-based authentication
- Environment variable configuration
- CORS enabled
- Input validation

## Safe Migration for Developers

If you or any developer faces migration errors (especially with tables like media_connect), run the following before running migrations:

```sh
yarn dev:cleanup
```

This will truncate problematic tables (media_connect, media_files, product_categories, categories, products) and ensure a clean state. **WARNING: This deletes all data in those tables. Do not use in production!**

Then run:

```sh
yarn migration:run
```

This guarantees that migrations will run without errors in development.

## License

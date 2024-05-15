## Authentication API Server in Express.js

### Project Overview

The API server is built using Express.js and TypeScript. The project uses MariaDB for the database and Knex.js for database communication.

### Prerequisites

Before running the application, configure the `.env` file with the following:

- API server port
- Database access credentials
- SMTP server access credentials
- Domain address using the API server
- Bcrypt cost value for password hashing
- Token expiration time
- Token encryption key

### Running the Project

1. Install all dependencies:
   ```bash
   npm install
   ```
2. Run the project:
   ```bash
   npm run dev
   ```
   For the production version:
   ```bash
   npm run prod
   ```

### Clustering

The server uses the cluster module to run one cluster per available CPU core. In the testing environment, only one cluster is always run.

### API Functionality

- Login
- Registration
- Password reset via email
- Checking, creating, editing, and deleting users
- Checking available roles

If a request does not exist, the API returns a 404 error. Errors are handled by `handleError`, which returns error responses and logs them in the console.

### Authentication

Authentication is performed using JSON Web Tokens (JWT). The token validity period can be set in the `.env` file in seconds. The token is refreshed 15 minutes before it expires if the user sends a request to the server.

### Roles

There are two roles available:

- **Admin**: Access to all requests.
- **Moderator**: Access to selected requests only.

### Project Structure

- `/src/databases/`: Knex.js configuration, migrations, and seeds.
- `/src/controllers/`: Request handling code.
- `/src/middlewares/`: Helper code, error handling, token and permission verification.
- `/src/routes/`: Handles API routes.
- `/test/`: Request tests.

### Production Version

To run the production version on the server, we use `pm2`. Ensure that the `NODE_ENV` variable in the `.env` file is set to `production` and that all variables are correctly configured.

To start the server:

```bash
npm run prod
```

### Database Structure

#### `roles` Table

Contains a list of roles.

| Field         | Type   | Description |
| ------------- | ------ | ----------- |
| `id`          | Index  |             |
| `name`        | string | Role name   |
| `create_data` | date   | Date added  |

#### `users` Table

Contains a list of users.

| Field         | Type   | Description            |
| ------------- | ------ | ---------------------- |
| `id`          | Index  |                        |
| `email`       | string | Email                  |
| `password`    | string | Bcrypt hashed password |
| `firstName`   | string | First name             |
| `lastName`    | string | Last name              |
| `create_data` | date   | Creation date          |
| `update_data` | date   | Update date            |

#### `user_roles` Table

Assigns roles to users.

| Field      | Type  | Description                    |
| ---------- | ----- | ------------------------------ |
| `id`       | Index |                                |
| `userId`   | Index | User ID from the `users` table |
| `roleId`   | Index | Role ID from the `roles` table |
| `add_data` | date  | Role assignment date           |

#### `password_reset_tokens` Table

Stores password reset tokens.

| Field          | Type   | Description                    |
| -------------- | ------ | ------------------------------ |
| `id`           | Index  |                                |
| `userId`       | Index  | User ID from the `users` table |
| `token`        | string | Password reset token           |
| `create_data`  | date   | Date added                     |
| `expires_data` | date   | Token expiration date          |

### API Endpoints

#### Without Authorization

- `GET /`: Returns status 200 OK.

#### Auth

- `POST /auth/login`: User login.

  - `email`: string
  - `password`: string

- `POST /auth/register`: Register a new user.

  - `email`: string
  - `password`: string
  - `firstName`: string
  - `lastName`: string

- `POST /auth/requestResetPassword`: Create a password reset token and send a link to the email.

  - `email`: string

- `POST /auth/resetPassword`: Reset the user's password.
  - `token`: string
  - `password`: string

#### With Authorization

- `POST /auth/logout`: User logout.

#### Admin Role

##### Roles

- `GET /admin/roles`: Returns a list of roles.

##### Users

- `GET /admin/users`: Returns a list of users.

- `GET /admin/users/:id`: Returns the user with a specific ID.

- `POST /admin/users`: Adds a new user.

  - `email`: string
  - `password`: string
  - `firstName`: string
  - `lastName`: string
  - `role`: `'moderator'`, `'admin'`

- `PUT /admin/users/:id`: Updates user data.

  - `email`: string
  - `password?`: string
  - `firstName`: string
  - `lastName`: string
  - `role?`: `'moderator'`, `'admin'`

- `DELETE /admin/users/:id`: Deletes a user.

#### Moderator Role

- `GET /admin/users`: Returns a list of users.

- `GET /admin/users/:id`: Returns the user with a specific ID.

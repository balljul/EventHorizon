 # EventHorizon Backend

 > A scalable, modular backend for the Event Management and Planning application built with NestJS and PostgreSQL.

 ## 📦 Tech Stack

 - **Node.js** + **TypeScript**
 - **NestJS** (Modules, Controllers, Services, DTOs)
 - **PostgreSQL** + **TypeORM**
 - **Redis** (caching, queues)
 - **MinIO** (S3-compatible storage)
 - **JWT** Authentication & Role-based Authorization
 - **Swagger** (OpenAPI) documentation
 - **Docker** & **Docker Compose** for containerization
 - **Jest** for unit & integration testing
 - **ESLint** & **Prettier** for linting & formatting

 ## 🚀 Getting Started

 ### Prerequisites

 - **Node.js** >= 18
 - **npm**, **bun**, or **yarn**
 - **Docker** & **Docker Compose** (for local containers)

 ### 1. Clone the repo & install dependencies

 ```bash
 cd backend
 # Install dependencies (choose one)
 bun install --frozen-lockfile
 # or
 npm install
 # or
 yarn install
 ```

 ### 2. Environment variables

 Copy the example file and adjust as needed:

 ```bash
 cp .env.example .env
 ```

 ### 3. Database setup & migrations

 This project uses TypeORM migrations to manage schema changes.

```bash
# Build and run migrations against DATABASE_URL
npm run build
npm run migration:run

# To generate a new migration after updating entities:
npm run migration:generate -- -n MigrationName

# To revert the last migration:
npm run migration:revert
```

 ### 4. Running the application

 #### Development mode (watch)

 ```bash
 npm run start:dev
 ```

 #### Production mode

 ```bash
 npm run build
 npm run start:prod
 ```

 ### 5. API documentation

 Once the server is running, Swagger UI is available at:

 ```
 http://localhost:3000/api-docs
 ```

 ### 6. Testing

 ```bash
 npm run test       # unit tests
 npm run test:e2e   # end-to-end tests
 npm run test:cov   # coverage report
 ```

 ### 7. Docker & Docker Compose

 From the project root:

 ```bash
 docker-compose up --build
 ```

 This will start:
 - PostgreSQL
 - Redis
 - MinIO
 - Backend
 - Frontend (if available)
 - Nginx reverse proxy

 ## 🧱 Project Structure

 ```
 backend/
 ├── src/
 │   ├── app.module.ts      # Root application module
 │   ├── main.ts            # Entry point
 │   ├── auth/              # Authentication & authorization
 │   ├── users/             # User management
 │   ├── events/            # Event entity & operations
 │   ├── tickets/           # Ticketing & validation
 │   ├── venues/            # Venue management
 │   ├── categories/        # Event categories
 │   └── attendees/         # Attendee registrations
 ├── migrations/            # TypeORM migrations
 ├── test/                  # E2E & integration tests
 ├── Dockerfile             # Production container
 ├── .env.example           # Sample environment variables
 ├── nest-cli.json          # Nest CLI config
 ├── tsconfig*.json         # TypeScript configs
 └── README.md              # This file
 ```

 ## ⚙️ Configuration & Environment

 Configuration is managed via `@nestjs/config`. Any `.env` variables will be loaded automatically.

 ## 🔖 License

 This project is open source and available under the MIT License.
# Newsletter Backend

## Project Overview

A comprehensive backend for a newsletter management application built with NestJS, TypeORM, and PostgreSQL. Supports multi-tenancy, subscriber management, list segmentation, and campaign creation.

## Key Features

- User Authentication
- Organization Management
- Subscriber Management
- List Management
  - Custom Fields
  - Segmentation
- Campaign Management
- Multi-Tenancy Support

## Prerequisites

- Node.js (v16+ recommended)
- PostgreSQL
- Postman (optional, for API testing)

## Installation

1. Clone the repository

```bash
git clone https://github.com/your-username/newsletter-backend.git
cd newsletter-backend
```

2. Install dependencies

```bash
npm install
```

3. Configure Database

- Create a PostgreSQL database
- Update `.env` file with your database credentials
  ```
  DATABASE_HOST=localhost
  DATABASE_PORT=5432
  DATABASE_USER=your_username
  DATABASE_PASSWORD=your_password
  DATABASE_NAME=newsletter_db
  ```

4. Run Migrations

```bash
npm run typeorm migration:run
```

## Running the Application

### Development Mode

```bash
npm run start:dev
```

### Production Mode

```bash
npm run build
npm run start:prod
```

## Testing APIs

### Postman Collection

A comprehensive Postman collection is available:

- File: `newsletter-backend-postman-collection.json`
- Import into Postman for easy API testing

### API Testing Guide

Detailed testing instructions in:

- File: `API_TESTING_GUIDE.md`

### Key Testing Steps

1. Create an Organization
2. Register a User
3. Add Subscribers
4. Create Lists
5. Design Campaigns
6. Send Campaigns

## Security Considerations

- JWT Authentication
- Role-based Access Control
- Multi-Tenancy with Organization Isolation
- Input Validation
- Secure Password Hashing

## Development Tools

- NestJS
- TypeORM
- PostgreSQL
- Passport.js (Authentication)
- Class Validator
- AWS SES (Optional Email Provider)

# MVP BE
## Node version >= 18

## Description

MVP BE without Passport using Bcrypt, JWT and Redis

## Features

1. Register
2. Login
3. Show profile
4. Logout

## Technologies stack:

- JWT
- Bcrypt
- TypeORM + MySQL
- Redis
- Docker

## Setup

### 1. Install the required dependencies

```bash
$ npm install
```

### 2. Rename the .env.example filename to .env and set your local variables

```bash
$ mv .env.example .env
```

### 3. Start the application

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Docker for development

```bash
# start the application
$ npm run docker:up

# stop the application
$ npm run docker:down
```

## Swagger documentation / API document

- {HOST}/docs

## License

Release under the terms of [MIT](./LICENSE)

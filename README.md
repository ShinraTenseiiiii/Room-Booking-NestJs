# Job Applying and Seat Booking Portal

A comprehensive portal built with Angular, NestJS and MongoDB with Typescript. This application allows users to apply for jobs, book seats in rooms, check availability, and manage bookings.

<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="200" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://coveralls.io/github/nestjs/nest?branch=master" target="_blank"><img src="https://coveralls.io/repos/github/nestjs/nest/badge.svg?branch=master#9" alt="Coverage" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow"></a>
</p>


## Features

- **User Authentication**: Secure login and registration.
- **Job Application**: Apply for jobs and schedule meetings.
- **Room Booking**: Book rooms for specific dates.
- **Availability Check**: Check room availability for a given date.
- **Booking Management**: View past and upcoming bookings.
- **Admin Features**: Manage users, job applications, and bookings.

## Installation

1. **Clone the repository**:
    ```bash
    git clone https://github.com/ShinraTenseiiiii/Room-Booking-NestJs.git
    ```

2. **Install dependencies**:
    ```bash
    npm install
    ```

3. **Set up environment variables**:
    Create a `.env` file in the root directory and add the following:
    ```env
    MONGO_URI=your_mongodb_connection_string
    JWT_SECRET=your_jwt_secret
    ```

## Running the App

### Development

```bash
# Start the application in development mode
npm run start

# Start the application in watch mode
npm run d
```

### Production

```bash
# Build the application
npm run build

# Start the application in production mode
npm run start:prod
```

### Testing

```bash
# Run unit tests
npm run test

# Run e2e tests
npm run test:e2e

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:cov
```

## API Endpoints

### User Authentication

- **Register**: `POST /users`
- **Login**: `POST /users/login`
- **Current User**: `GET /users`

### Job Application

- **Apply for a Job**: `POST /users/applyFor`
- **Update Application Status**: `POST /users/update-application-status/:username/:role`
- **Schedule Meeting**: `POST /users/schedule-meeting/:username/:jobId`
- **Get All Users**: `GET /users/all-users`

### Room Booking

- **Book a Seat**: `POST /bookings/book-seat`
- **Check Availability**: `GET /bookings/availability`
- **Booking Details**: `GET /bookings/booking-details`

## Demo

Check out the live demo of the application [here](https://booking-app-phi-nine.vercel.app/).

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---
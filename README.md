# Beam - A Lightweight VoD Streaming Service

Beam is a lightweight Video on Demand (VoD) streaming service designed to provide a seamless experience for uploading and streaming videos. This project is open-source and can be easily deployed using Docker Compose.

## Features

- **User Authentication**: Secure registration and login using JWT-based authentication.
- **Role-Based Access Control**: Assign specific permissions to different user roles (Admin, Uploader, Viewer).
- **Video Management**: Upload videos and convert them into multiple resolutions for adaptive streaming.
- **HLS Streaming**: Deliver videos using HTTP Live Streaming (HLS) for adaptive bitrate streaming.
- **4K Video Support**: Out of the box support for uploading and streaming 4K videos.
- **API Documentation**: Detailed API documentation available through Swagger.
- **Rate Limiting**: Protect endpoints from excessive requests with rate limiting.
- **Security**: Enhanced security features with Helmet and CORS.
- **Request Validation**: Validate incoming requests using Joi schemas to ensure data integrity.

## Quick Start

To quickly start the application using Docker Compose, follow these steps:

1. Ensure you have Docker and Docker Compose installed on your machine.
2. Set up the necessary environment variables in the `docker-compose.yml` file or a `.env` file. Refer to the [Environment Variables](#environment-variables) section for details.
3. Download the `docker-compose.yml` file from this repository.
4. Run the following command in the directory containing the `docker-compose.yml` file:

   ```bash
   docker-compose up
   ```

This will pull the necessary Docker image from Docker Hub and start the application.

## Environment Variables

The application requires the following environment variables, which are set in the `docker-compose.yml` file:

- `MONGO_DB_URI`: MongoDB connection string.
- `JWT_SECRET_KEY`: Secret key for signing JWT tokens.
- `DEFAULT_USERNAME`: Default admin username.
- `DEFAULT_PASSWORD`: Default admin password.
- `BASE_URL`: Base URL for the application.

## API Endpoints

### Authentication

- **Register**: `POST /auth/register`
- **Login**: `POST /auth/login`
- **Change Password**: `POST /auth/change-password`

### Videos

- **Upload Video**: `POST /videos/upload`
- **List Videos**: `GET /streams`

## Code Structure

- **Server**: The main server setup and configuration can be found in `src/server.ts`.
- **Database**: MongoDB connection logic is in `src/db.ts`.
- **Models**: Mongoose models for User and Video are in `src/models/userModel.ts` and `src/models/videoModel.ts`.
- **Routes**: API routes are defined in `src/routes/`.
- **Middlewares**: Custom middlewares for authentication and scope checking are in `src/middlewares/`.
- **Validation**: Request validation logic using Joi is in `src/validation/`.

## Contributing

Contributions are welcome! Please fork the repository and submit a pull request for any improvements or bug fixes.

## License

This project is licensed under the ISC License.

## Author

Moltas Thörnblom

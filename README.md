# YouTube Clone Project

This repository contains the backend implementation for a YouTube clone. The project is built using Node.js, Express.js, MongoDB, and other modern tools and libraries. It includes functionality for user authentication, video uploads, watch history, and more.

## Features

- **User Authentication**
  - User registration and login with JWT-based access and refresh tokens.
  - Password hashing with bcrypt for enhanced security.

- **Profile Management**
  - Users can upload profile avatars and cover images via Cloudinary.

- **Video Management**
  - Users can upload, view, and manage videos.
  - Watch history tracking for each user.

- **Token Management**
  - Refresh tokens for session management.
  - Secure storage of tokens in cookies.

## Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: MongoDB (with Mongoose)
- **Authentication**: JSON Web Tokens (JWT), bcrypt
- **File Uploads**: Cloudinary

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/your-repo.git
   cd your-repo
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   Create a `.env` file in the root directory and add the following:
   ```env
   ACCESS_TOKEN_SECRET=your_access_token_secret
   REFRESH_TOKEN_SECRET=your_refresh_token_secret
   ACCESS_TOKEN_EXPIRY=15m
   REFRESH_TOKEN_EXPIRY=7d
   CLOUDINARY_NAME=your_cloudinary_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret
   MONGO_URI=your_mongo_database_url
   ```

4. Start the server:
   ```bash
   npm run dev
   ```

   The server will run on `http://localhost:5000` by default.

## API Endpoints

### User Routes
- `POST /api/v1/register`: Register a new user.
- `POST /api/v1/login`: Log in a user.
- `POST /api/v1/logout`: Log out a user.

### Profile Routes
- `GET /api/v1/get-user`: Fetch the logged-in user's profile.
- `PUT /api/v1/update-details`: Update user profile details.

### Change Avatar and coverImage Routes
- `GET /api/v1/change-avatar`: Fetch the logged-in user's profile.
- `PUT /api/v1/change-cover-image`: Update user profile details.

### Video Routes
- `POST /api/videos`: Upload a new video.
- `GET /api/videos`: Fetch all videos.
- `GET /api/videos/:id`: Fetch a specific video by ID.



## Project Structure

```plaintext
├── models
│   ├── user.model.js    # Mongoose schema and methods for user
│   ├── subscription.model.js      # Mongoose schema and methods for subscription
│   └── video.model.js   # Mongoose schema and methods for video
├── routes
│   └── user.routes.js   # User-related routes
├── controllers
│   ├── user.controller.js
│   ├──
|   ├──
├── db
|  └── db.js
├── middlewares
|  └── auth.middleware.js
|  ├── multer.middleware.js
├── services
│   └── cloudinary.js    # Cloudinary integration
├── utils
│   ├── asyncHandler.js  # Wrapper for async route handlers
│   ├── ApiError.js      # Custom error handling class
│   └── ApiResponse.js   # Standardized API response structure
├── src
│   ├── app.js.js         # starting of the express server
│   ├── constants.js      # constants variables like : db_name
│   └── server.js         # Entry point of the application
├── .env.example          # Example environment variables
├── .prettierrc           # project design structure        
└── README.md             # Project documentation
```

## Contributing

Contributions are welcome! Please fork the repository and submit a pull request for any feature additions or bug fixes.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Contact

For any questions or suggestions, feel free to contact me:
- GitHub: [Souvik273](https://github.com/Souvik273)
- Email: souvikgoswami464@gmail.com


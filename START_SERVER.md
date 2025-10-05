# How to Start the Server

## Prerequisites
1. Make sure Node.js is installed on your system
2. Make sure MongoDB is accessible (local or cloud)

## Environment Setup
Create a `.env` file in the root directory with:
```
MONGO_URI=your_mongodb_connection_string
SESSION_SECRET=your_session_secret_key
```

## Starting the Server
1. Open PowerShell/Terminal in this directory
2. Install dependencies (first time only):
   ```
   npm install
   ```
3. Start the server:
   ```
   npm start
   ```

## Testing the Server
- Local URL: http://localhost:3000
- Test endpoint: http://localhost:3000/api/test
- Health check: http://localhost:3000/api/health

## Features Available
- ✅ Local checkers game (works without server)
- ✅ Online multiplayer with game codes
- ✅ Professional UI without emojis
- ✅ MongoDB integration for future projects
- ✅ Express.js foundation for expansion

## Server Structure
- `server.js` - Main server file
- `public/` - Static files (HTML, CSS, JS)
- `public/js/checkers.js` - Game logic
- `public/js/index.js` - Multiplayer functionality

## For Future Projects
This server provides:
- Express.js framework
- MongoDB database connection
- Session management
- Static file serving
- RESTful API endpoints
- Security headers (helmet)
- Professional logging (morgan)
# AI Chat SaaS Backend

A production-ready AI Chat SaaS backend built with **Node.js**, **Express**, **MongoDB**, and **TypeScript**, powered by **Google Gemini** with real-time streaming support.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js 18+ |
| Framework | Express 4 |
| Language | TypeScript 5 |
| Database | MongoDB + Mongoose |
| AI Provider | Google Gemini 2.0 Flash |
| Authentication | JWT (Access + Refresh Token Rotation) |
| Security | Helmet, CORS, Rate Limiting, bcrypt |
| Streaming | Server-Sent Events (SSE) |

---

## Project Structure

```
ai-chat-saas-backend/
├── src/
│   ├── config/
│   │   ├── db.ts              # MongoDB connection
│   │   └── gemini.ts          # Gemini client + safety settings
│   ├── controllers/
│   │   ├── authController.ts  # Register, login, refresh, logout
│   │   └── chatController.ts  # Conversations + streaming messages
│   ├── middlewares/
│   │   ├── authMiddleware.ts  # JWT protect + restrictTo guards
│   │   └── errorHandler.ts    # Global error + 404 handler
│   ├── models/
│   │   ├── User.ts            # User schema + bcrypt hooks
│   │   ├── Conversation.ts    # Conversation metadata
│   │   └── Message.ts         # Individual messages
│   ├── routes/
│   │   ├── healthRoutes.ts    # GET /api/health
│   │   ├── authRoutes.ts      # POST /api/auth/*
│   │   └── chatRoutes.ts      # /api/chat/conversations/*
│   ├── services/
│   │   ├── authService.ts     # Auth business logic
│   │   ├── geminiService.ts   # Streaming + title generation
│   │   └── chatService.ts     # Chat business logic
│   ├── types/
│   │   ├── index.ts           # Shared TypeScript interfaces
│   │   └── env.d.ts           # process.env type declarations
│   ├── utils/
│   │   ├── apiResponse.ts     # Uniform sendSuccess / sendError
│   │   └── jwt.ts             # Token sign, verify, cookie config
│   ├── validators/
│   │   └── authValidators.ts  # Request body validation middleware
│   └── index.ts               # App entry point
├── .env
├── .gitignore
├── package.json
├── tsconfig.json
└── README.md
```

---

## Getting Started

### Prerequisites

- Node.js 18 or higher
- MongoDB running locally or a MongoDB Atlas URI
- Google Gemini API key → [Get one here](https://aistudio.google.com/app/apikey)

### 1. Clone and Install

```bash
git clone https://github.com/your-username/ai-chat-saas-backend.git
cd ai-chat-saas-backend
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the project root:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/ai-chat-saas
JWT_ACCESS_SECRET=your_super_secret_access_key_min_32_chars
JWT_REFRESH_SECRET=your_super_secret_refresh_key_min_32_chars
GEMINI_API_KEY=your_gemini_api_key_here
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

> **Never commit `.env` to git.** It's already in `.gitignore`.

### 3. Run in Development

```bash
npm run dev
```

Server starts at `http://localhost:5000`

### 4. Build for Production

```bash
npm run build
npm start
```

---

## API Reference

### Base URL
```
http://localhost:5000/api
```

### Response Format

All endpoints return a consistent JSON structure:

**Success**
```json
{
  "success": true,
  "message": "Human readable message",
  "data": { }
}
```

**Error**
```json
{
  "success": false,
  "message": "Human readable error",
  "errors": ["field: specific issue"]
}
```

---

### Health

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/health` | No | Server + DB status |

**Response**
```json
{
  "success": true,
  "message": "Server is healthy",
  "data": {
    "status": "OK",
    "timestamp": "2026-04-23T10:00:00.000Z",
    "environment": "development",
    "database": "connected",
    "uptime": "42s"
  }
}
```

---

### Auth

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/auth/register` | No | Create new account |
| POST | `/auth/login` | No | Login, get tokens |
| POST | `/auth/refresh` | No (cookie) | Rotate refresh token |
| POST | `/auth/logout` | Bearer | Invalidate session |

#### POST `/auth/register`

**Request Body**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "Secret123"
}
```

**Password Rules:** min 8 chars, must contain uppercase, lowercase, and a number.

**Response `201`**
```json
{
  "success": true,
  "message": "Account created successfully",
  "data": {
    "user": {
      "id": "664f...",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "user"
    },
    "accessToken": "eyJhbGci..."
  }
}
```

> A `refreshToken` is also set as an **HttpOnly cookie** automatically.

---

#### POST `/auth/login`

**Request Body**
```json
{
  "email": "john@example.com",
  "password": "Secret123"
}
```

**Response `200`** — same shape as register.

---

#### POST `/auth/refresh`

No request body needed. Reads the `refreshToken` HttpOnly cookie automatically.

**Response `200`**
```json
{
  "success": true,
  "message": "Token refreshed",
  "data": {
    "accessToken": "eyJhbGci..."
  }
}
```

---

#### POST `/auth/logout`

**Headers**
```
Authorization: Bearer <accessToken>
```

**Response `200`**
```json
{
  "success": true,
  "message": "Logged out successfully",
  "data": null
}
```

---

### Chat

All chat endpoints require:
```
Authorization: Bearer <accessToken>
```

| Method | Endpoint | Description |
|---|---|---|
| POST | `/chat/conversations` | Create a new conversation |
| GET | `/chat/conversations` | List all conversations (paginated) |
| GET | `/chat/conversations/:id` | Get conversation + full message history |
| POST | `/chat/conversations/:id/messages` | Send message, stream AI response |
| DELETE | `/chat/conversations/:id` | Soft delete a conversation |

---

#### POST `/chat/conversations`

**Request Body**
```json
{
  "title": "My First Chat",
  "model": "gemini-2.0-flash"
}
```

Both fields are optional. Default title is `"New Conversation"`, default model is `"gemini-2.0-flash"`.

**Response `201`**
```json
{
  "success": true,
  "message": "Conversation created",
  "data": {
    "id": "664f...",
    "title": "My First Chat",
    "model": "gemini-2.0-flash",
    "messageCount": 0,
    "lastMessageAt": "2026-04-23T10:00:00.000Z",
    "createdAt": "2026-04-23T10:00:00.000Z"
  }
}
```

---

#### GET `/chat/conversations`

**Query Parameters**

| Param | Type | Default | Description |
|---|---|---|---|
| page | number | 1 | Page number |
| limit | number | 20 | Results per page |

**Response `200`**
```json
{
  "success": true,
  "message": "Conversations fetched",
  "data": {
    "conversations": [...],
    "total": 42,
    "hasMore": true
  }
}
```

---

#### POST `/chat/conversations/:id/messages` — Streaming

This endpoint uses **Server-Sent Events (SSE)**. The response is a stream, not a standard JSON response.

**Request Body**
```json
{
  "content": "Explain how JWT refresh tokens work"
}
```

**Stream Events**

```
event: message_saved
data: {"userMessage": {"id": "...", "role": "user", "content": "...", "createdAt": "..."}}

event: chunk
data: {"text": "JWT"}

event: chunk
data: {"text": " refresh tokens"}

event: done
data: {"fullContent": "JWT refresh tokens work by..."}
```

**On error:**
```
event: error
data: {"message": "Something went wrong"}
```

**How to consume in the browser:**
```javascript
const evtSource = new EventSource(
  `/api/chat/conversations/${id}/messages`,
  // Note: EventSource doesn't support POST natively.
  // Use fetch with a ReadableStream instead:
);

// Recommended: use fetch + ReadableStream
const res = await fetch(`/api/chat/conversations/${id}/messages`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${accessToken}`
  },
  body: JSON.stringify({ content: userMessage })
});

const reader = res.body.getReader();
const decoder = new TextDecoder();

while (true) {
  const { done, value } = await reader.read();
  if (done) break;

  const text = decoder.decode(value);
  // Parse SSE lines and extract event + data
  console.log(text);
}
```

---

## Authentication Flow

```
Register / Login
      │
      ▼
accessToken (15min)  ──► Sent in response body
refreshToken (7d)    ──► Set as HttpOnly cookie

Every API request:
  Authorization: Bearer <accessToken>

When accessToken expires:
  POST /api/auth/refresh  (cookie sent automatically)
      │
      ▼
  New accessToken + rotated refreshToken

Logout:
  Refresh token deleted from DB
  Cookie cleared
  Any future refresh attempts rejected
```

---

## Security Features

| Feature | Implementation |
|---|---|
| Password hashing | bcrypt with 12 salt rounds |
| Token storage | Refresh token in HttpOnly cookie (not localStorage) |
| Token rotation | New refresh token on every `/refresh` call |
| Token reuse detection | Replay attack → all sessions invalidated |
| User enumeration prevention | Same error for wrong email and wrong password |
| Rate limiting | 100 req/15min global, 10 req/15min on auth routes |
| Security headers | Helmet (X-Frame-Options, CSP, HSTS, etc.) |
| Payload size limit | 10kb max request body |
| CORS | Whitelist only `CLIENT_URL` |
| Role-based access | `restrictTo('admin')` middleware guard |

---

## Available Scripts

```bash
npm run dev          # Start dev server with hot reload
npm run build        # Compile TypeScript to dist/
npm start            # Run compiled production build
npm run type-check   # Check types without emitting files
```

---

## Environment Variables Reference

| Variable | Required | Description |
|---|---|---|
| `PORT` | No | Server port (default: 5000) |
| `MONGO_URI` | Yes | MongoDB connection string |
| `JWT_ACCESS_SECRET` | Yes | Secret for signing access tokens (min 32 chars) |
| `JWT_REFRESH_SECRET` | Yes | Secret for signing refresh tokens (min 32 chars) |
| `GEMINI_API_KEY` | Yes | Google Gemini API key |
| `CLIENT_URL` | Yes | Frontend URL for CORS (e.g. http://localhost:5173) |
| `NODE_ENV` | No | `development` or `production` |

---

## Common Errors & Fixes

**`MongoServerError: connect ECONNREFUSED`**
→ MongoDB is not running. Start it with `mongod` or check your Atlas URI.

**`Error: GEMINI_API_KEY is not defined`**
→ Missing `.env` file or variable not set.

**`JsonWebTokenError: invalid signature`**
→ Access token was tampered with or wrong secret used.

**`TokenExpiredError`**
→ Access token expired (15min). Call `POST /api/auth/refresh` to get a new one.

**SSE stream arrives all at once instead of chunk by chunk**
→ Your reverse proxy (Nginx) is buffering. Add `X-Accel-Buffering: no` header (already set in the controller).

---

## License

MIT
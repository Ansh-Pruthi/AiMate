declare global {
  namespace NodeJS {
    interface ProcessEnv {
      PORT: String;
      MONGO_URI: String;
      JWT_ACCESS_SECRET: string;
      JWT_REFRESH_SECRET: string;
      GEMINI_API_KEY: string;
      CLIENT_URL: string;
      NODE_ENV: "development" | "production" | "test";
    }
  }
}

export {}
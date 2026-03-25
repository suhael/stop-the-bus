// apps/mobile/src/config/env.ts
import { z } from 'zod';

// 1. Define your strict schema
const envSchema = z.object({
  EXPO_PUBLIC_SERVER_URL: z.string().url({ 
    message: "EXPO_PUBLIC_SERVER_URL must be a valid URL (e.g., http://192.168.1.50:3000)" 
  }),
  // Add future env vars here (e.g., API keys, analytics IDs)
});

// 2. Parse the environment variables safely
const envParse = envSchema.safeParse({
  EXPO_PUBLIC_SERVER_URL: process.env.EXPO_PUBLIC_SERVER_URL,
});

// 3. Export the validated data OR the errors
export const ENV = envParse.success ? envParse.data : null;
export const ENV_ERRORS = envParse.success ? null : envParse.error.issues;
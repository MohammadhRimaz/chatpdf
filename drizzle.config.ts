import { defineConfig } from "drizzle-kit";
import * as dotenv from "dotenv";
// import 'dotenv/config';

dotenv.config({ path: ".env" });

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/lib/db/schema.ts",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});

// export default defineConfig({
//   out: './drizzle',
//   schema: './src/db/schema.ts',
//   dialect: 'postgresql',
//   dbCredentials: {
//     url: process.env.DATABASE_URL!,
//   },
// });

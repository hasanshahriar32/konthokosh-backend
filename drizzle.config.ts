import { channels } from './src/db/schema/channels';
import type { Config } from 'drizzle-kit';
import { DATABASE_DIALECT, DATABASE_URL } from './src/configs/envConfig';

export default {
  schema: [
    './dist/src/db/schema/rbac.js',
    './dist/src/db/schema/users.js',
    './dist/src/db/schema/posts.js',
    './dist/src/db/schema/products.js',
    './dist/src/db/schema/channels.js',
    './dist/src/db/schema/embedDataSchema.js',
    './dist/src/db/schema/fileUploadSchema.js',
    './dist/src/db/schema/project.js',
    './dist/src/db/schema/embedding.task.js',
    './dist/src/db/schema/postEmbeddings.js',
  ],
  out: './drizzle',
  dialect: DATABASE_DIALECT,
  dbCredentials: {
    url: DATABASE_URL,
  },
  verbose: true,
  strict: true,
} satisfies Config;

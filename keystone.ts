import 'dotenv/config';

import { config } from '@keystone-next/keystone';

// Look in the schema file for how we define our lists, and how users interact with them through graphql or the Admin UI
import { lists } from './schema';

// Keystone auth is configured separately - check out the basic auth setup we are importing from our auth file.
import { withAuth, session } from './auth';
import { insertSeedData } from './seed-data';
import { extendGraphqlSchema } from './mutations/Index';

export default withAuth(
  config({
    server: {
      cors: {
        origin: [process.env.FRONTEND_URL as string],
        credentials: true,
      },
    },
    db: {
      useMigrations: process.env.NODE_ENV === 'development',

      provider: 'postgresql',
      url: process.env.DB_URL as string,
      idField: { kind: 'uuid' },
      async onConnect(keystone) {
        if (process.argv.includes('--seed-data')) {
          await insertSeedData(keystone);
        }
      },
    },

    extendGraphqlSchema,
    ui: {
      // For our starter, we check that someone has session data before letting them see the Admin UI.
      isAccessAllowed: (context) => !!context.session?.data,
    },
    lists,
    session,
  })
);

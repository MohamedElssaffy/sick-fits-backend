import 'dotenv/config';
import { config, createSchema } from '@keystone-next/keystone/schema';
import { createAuth } from '@keystone-next/auth';
import {
  withItemData,
  statelessSessions,
} from '@keystone-next/keystone/session';

import { User } from './schemas/User';
import { Role } from './schemas/Role';
import { Product } from './schemas/Product';
import { CartItem } from './schemas/CartItem';
import { Order } from './schemas/Order';
import { OrderItem } from './schemas/OrderItem';
import { ProductImage } from './schemas/ProductImage';
import { insertSeedData } from './seed-data/index';
import { sendResetPasswordToken } from './lib/mail';
import { extendGraphqlSchema } from './mutations/Index';
import { permissionsList } from './schemas/fields';

const dataBaseUrl = process.env.DATABASE_URL;

const sessionConfig = {
  maxAge: 60 * 60 * 24 * 30,
  secret: process.env.COOKIE_SECRET,
};

const { withAuth } = createAuth({
  listKey: 'User',
  identityField: 'email',
  secretField: 'password',
  initFirstItem: {
    fields: ['name', 'email', 'password'],
  },

  passwordResetLink: {
    async sendToken({ identity, token }) {
      await sendResetPasswordToken(identity, token);
    },
  },
});

export default withAuth(
  config({
    server: {
      cors: {
        origin: [process.env.FRONTEND_URL],
        credentials: true,
      },
    },
    db: {
      adapter: 'mongoose',
      url: dataBaseUrl,
      async onConnect(keystone) {
        if (process.argv.includes('--seed-data')) {
          await insertSeedData(keystone);
        }
      },
    },

    lists: createSchema({
      User,
      Role,
      Product,
      ProductImage,
      CartItem,
      Order,
      OrderItem,
    }),
    extendGraphqlSchema,
    ui: {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      isAccessAllowed: ({ session }) => !!session?.data,
    },
    session: withItemData(statelessSessions(sessionConfig), {
      User: `id name role {${permissionsList.join(' ')}}`,
    }),
  })
);

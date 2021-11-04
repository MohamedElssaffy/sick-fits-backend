import { integer, relationship, text } from '@keystone-next//keystone/fields';
import { list } from '@keystone-next/keystone';
import { isAdmin, isSignIn, rules } from '../access';

export const Order = list({
  access: {
    operation: {
      create: isSignIn,
    },
    filter: {
      query: rules.canOrder,
      update: () => false,
      delete: isAdmin,
    },
  },
  fields: {
    total: integer(),
    items: relationship({ ref: 'OrderItem.order', many: true }),
    user: relationship({
      ref: 'User.orders',
      hooks: {
        resolveInput: ({ context, resolvedData, operation }) => {
          const id = context.session?.itemId;

          if (operation === 'create') {
            resolvedData.user = { connect: { id } };
          }
          return resolvedData.user;
        },
      },
    }),
    charge: text(),
  },
  ui: {
    listView: {
      initialColumns: ['total', 'user', 'charge', 'items'],
    },
  },
});

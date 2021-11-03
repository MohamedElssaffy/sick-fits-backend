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
    user: relationship({ ref: 'User.orders' }),
    charge: text(),
  },
  ui: {
    listView: {
      initialColumns: ['total', 'user', 'charge', 'items'],
    },
  },
});

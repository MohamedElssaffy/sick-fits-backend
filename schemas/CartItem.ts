import { integer, relationship } from '@keystone-next/keystone/fields';
import { list } from '@keystone-next/keystone';
import { isSignIn, rules } from '../access';

export const CartItem = list({
  access: {
    operation: {
      create: isSignIn,
    },
    filter: {
      query: rules.canOrder,
      update: rules.canOrder,
      delete: rules.canOrder,
    },
  },
  ui: {
    listView: {
      initialColumns: ['product', 'quantity', 'user'],
    },
  },
  fields: {
    quantity: integer({ defaultValue: 1, validation: { isRequired: true } }),
    product: relationship({ ref: 'Product' }),
    user: relationship({ ref: 'User.cart' }),
  },
});

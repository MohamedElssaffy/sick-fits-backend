import { integer, relationship, text } from '@keystone-next/keystone/fields';
import { list } from '@keystone-next/keystone';
import { isAdmin, isSignIn, rules } from '../access';

export const OrderItem = list({
  access: {
    operation: {
      create: isSignIn,
    },
    filter: {
      query: rules.canManageOrderItem,
      update: () => false,
      delete: isAdmin,
    },
  },
  fields: {
    name: text({ validation: { isRequired: true } }),
    description: text({ ui: { displayMode: 'textarea' } }),
    photo: relationship({
      ref: 'ProductImage',
      ui: {
        displayMode: 'cards',
        cardFields: ['image', 'altText'],
        inlineCreate: { fields: ['image', 'altText'] },
        inlineEdit: { fields: ['image', 'altText'] },
      },
    }),

    price: integer(),
    quantity: integer(),
    order: relationship({ ref: 'Order.items' }),
  },
});

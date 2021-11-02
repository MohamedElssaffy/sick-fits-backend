import { integer, relationship, text } from '@keystone-next/fields';
import { list } from '@keystone-next/keystone/schema';
import { isAdmin, isSignIn, rules } from '../access';

export const OrderItem = list({
  access: {
    create: isSignIn,
    read: rules.canManageOrderItem,
    update: () => false,
    delete: isAdmin,
  },
  fields: {
    name: text({ isRequired: true }),
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

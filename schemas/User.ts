import { list } from '@keystone-next/keystone';
import { text, password, relationship } from '@keystone-next/keystone/fields';
import { permissions, rules } from '../access';

export const User = list({
  access: {
    operation: {
      create: () => true,
    },
    filter: {
      query: rules.canManageUsers,
      update: rules.canManageUsers,
      delete: permissions.canManageUsers,
    },
  },
  ui: {
    hideCreate: (args) => !permissions.canManageUsers(args),
    hideDelete: (args) => !permissions.canManageUsers(args),
  },
  fields: {
    name: text({ validation: { isRequired: true } }),
    email: text({ validation: { isRequired: true }, isIndexed: 'unique' }),
    password: password(),
    cart: relationship({
      ref: 'CartItem.user',
      many: true,
      ui: {
        createView: { fieldMode: 'hidden' },
        itemView: { fieldMode: 'read' },
      },
    }),
    orders: relationship({ ref: 'Order.user' }),
    role: relationship({ ref: 'Role.assignedTo' }),

    products: relationship({ ref: 'Product.user', many: true }),
  },
});

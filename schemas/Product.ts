import {
  integer,
  relationship,
  select,
  text,
} from '@keystone-next/keystone/fields';
import { list } from '@keystone-next/keystone';
import { isSignIn, rules } from '../access';

export const Product = list({
  access: {
    operation: {
      create: isSignIn,
    },
    filter: {
      update: rules.canManageProducts,
      delete: rules.canManageProducts,
      query: rules.canReadProducts,
    },
  },
  hooks: {
    afterOperation: async ({ context, operation, originalItem }) => {
      if (operation === 'delete') {
        const photo = originalItem.photoId;
        if (photo) {
          await context.db.ProductImage.deleteOne({ where: { id: photo } });
        }
      }
    },
  },
  fields: {
    name: text({ validation: { isRequired: true } }),
    description: text({ ui: { displayMode: 'textarea' } }),
    photo: relationship({
      ref: 'ProductImage.product',
      ui: {
        displayMode: 'cards',
        cardFields: ['image', 'altText'],
        inlineCreate: { fields: ['image', 'altText'] },
        inlineEdit: { fields: ['image', 'altText'] },
      },
    }),
    status: select({
      options: [
        { label: 'Draft', value: 'DRAFT' },
        { label: 'Available', value: 'AVAILABLE' },
        { label: 'Unavailable', value: 'UNAVAILABLE' },
      ],
      defaultValue: 'DRAFT',
      ui: {
        displayMode: 'segmented-control',
        createView: { fieldMode: 'hidden' },
      },
    }),

    price: integer(),
    user: relationship({
      ref: 'User.products',

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
  },
});

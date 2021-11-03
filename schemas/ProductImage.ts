import { list } from '@keystone-next/keystone';
import { cloudinaryImage } from '@keystone-next/cloudinary';
import { relationship, text } from '@keystone-next/keystone/fields';
import { isSignIn, rules } from '../access';

export const cloudinary = {
  cloudName: process.env.CLOUDINARY_CLOUD_NAME as string,
  apiKey: process.env.CLOUDINARY_KEY as string,
  apiSecret: process.env.CLOUDINARY_SECRET as string,
  folder: 'sickFits',
};

export const ProductImage = list({
  access: {
    operation: {
      create: isSignIn,
    },
    filter: {
      update: rules.canManageProducts,
      delete: rules.canManageProducts,
      query: () => true,
    },
  },
  fields: {
    image: cloudinaryImage({
      cloudinary,
      label: 'Source',
    }),
    altText: text(),
    product: relationship({ ref: 'Product.photo' }),
  },
  ui: {
    listView: { initialColumns: ['image', 'altText', 'product'] },
  },
});

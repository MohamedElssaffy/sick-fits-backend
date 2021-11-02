/* eslint-disable @typescript-eslint/no-unsafe-return */
import { KeystoneContext } from '@keystone-next/types';
import { CartItemCreateInput } from '../.keystone/schema-types';
import { Session } from '../types';

interface CartItem extends CartItemCreateInput {
  id: string;
}

export default async function addToCart(
  _: unknown,
  { productId }: { productId: string },
  context: KeystoneContext
): Promise<CartItemCreateInput> {
  const session = context.session as Session;
  if (!session.itemId) {
    throw new Error('You must sign in to apply this action');
  }

  const allCartItems = await context.lists.CartItem.findMany({
    where: {
      user: { id: session.itemId },
      product: { id: productId },
    },
    resolveFields: 'id, quantity',
  });

  const [existingCart] = allCartItems as CartItem[];

  if (existingCart) {
    return context.lists.CartItem.updateOne({
      id: existingCart.id,
      data: {
        quantity: existingCart.quantity + 1,
      },
      resolveFields: false,
    });
  }

  return context.lists.CartItem.createOne({
    data: {
      product: { connect: { id: productId } },
      user: { connect: { id: session.itemId } },
    },
    resolveFields: false,
  });
}

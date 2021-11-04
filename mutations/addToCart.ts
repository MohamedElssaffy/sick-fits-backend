/* eslint-disable @typescript-eslint/no-unsafe-return */
import { KeystoneContext } from '@keystone-next/keystone/types';
import { Session, CartItem } from '../types';

export default async function addToCart(
  _: unknown,
  { productId }: { productId: string },
  context: KeystoneContext
): Promise<CartItem> {
  const session = context.session as Session;
  if (!session.itemId) {
    throw new Error('You must sign in to apply this action');
  }

  const allCartItems = await context.query.CartItem.findMany({
    where: {
      user: { id: { equals: session.itemId } },
      product: { id: { equals: productId } },
    },
    query: 'id, quantity',
  });

  const [existingCart] = allCartItems as CartItem[];

  if (existingCart) {
    return context.db.CartItem.updateOne({
      where: { id: existingCart.id },
      data: {
        quantity: existingCart.quantity + 1,
      },
    });
  }

  return context.db.CartItem.createOne({
    data: {
      product: { connect: { id: productId } },
      user: { connect: { id: session.itemId } },
    },
  });
}

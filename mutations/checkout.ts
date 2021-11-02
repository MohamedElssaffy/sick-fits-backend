/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import { KeystoneContext } from '@keystone-next/types';
import {
  CartItemCreateInput,
  OrderCreateInput,
  UserCreateInput,
} from '../.keystone/schema-types';
import stripeConfig from '../lib/stripe';
import { Session } from '../types';

export default async function checkout(
  _: unknown,
  { token }: { token: string },
  context: KeystoneContext
): Promise<OrderCreateInput> {
  const session = context.session as Session;
  if (!session.itemId) {
    throw new Error('You must sign in to apply this action');
  }

  const user = await context.lists.User.findOne({
    where: { id: session.itemId },
    resolveFields: `
		id
		name
		email
		cart {
			id
			quantity
			product {
				id
				name
				description
				price
				photo {
					id
					image {
						id
						publicUrlTransformed
					}
				}
			}
		}
	`,
  });

  const cartItems = user.cart.filter(
    (item: CartItemCreateInput) => item.product
  );

  const totalAmount = cartItems.reduce(
    (acc: number, currItem: CartItemCreateInput) =>
      acc + currItem.quantity * currItem.product.price,
    0
  );

  const charge = await stripeConfig.paymentIntents
    .create({
      amount: totalAmount,
      confirm: true,
      currency: 'USD',
      payment_method: token,
    })
    .catch((e) => {
      console.error(e);
      throw new Error(e.message);
    });

  const orderItems = cartItems.map((item) => ({
    name: item.product.name,
    description: item.product.description,
    price: item.product.price,
    quantity: item.quantity,
    photo: { connect: { id: item.product.photo.id } },
  }));

  const order = await context.lists.Order.createOne({
    data: {
      total: charge.amount,
      charge: charge.id,
      user: { connect: { id: session.itemId } },
      items: { create: orderItems },
    },
    resolveFields: `
      id
      total
      charge
    `,
  });

  const cartItemsIds = user.cart.map((item) => item.id);

  await context.lists.CartItem.deleteMany({
    ids: cartItemsIds,
  });
  return order;
}

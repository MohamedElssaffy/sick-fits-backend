/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import { KeystoneContext } from '@keystone-next/keystone/types';
import { CartItem } from '../types';
import stripeConfig from '../lib/stripe';
import { Session } from '../types';

export default async function checkout(
  _: unknown,
  { token }: { token: string },
  context: KeystoneContext
): Promise<any> {
  const session = context.session as Session;
  if (!session.itemId) {
    throw new Error('You must sign in to apply this action');
  }

  const user = await context.query.User.findOne({
    where: { id: session.itemId },
    query: `
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

  const cartItems = user.cart.filter((item: CartItem) => item.product);

  const totalAmount = cartItems.reduce(
    (acc: number, currItem: CartItem) =>
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

  const orderItems = cartItems.map(
    (item: {
      product: { name: any; description: any; price: any; photo: { id: any } };
      quantity: any;
    }) => {
      const photo = item.product?.photo?.id
        ? { connect: { id: item.product?.photo?.id } }
        : null;
      return {
        name: item.product.name,
        description: item.product.description,
        price: item.product.price,
        quantity: item.quantity,
        photo,
      };
    }
  );

  const order = await context.db.Order.createOne({
    data: {
      total: charge.amount,
      charge: charge.id,
      user: { connect: { id: session.itemId } },
      items: { create: orderItems },
    },
  });

  const cartItemsIds = user.cart.map((item: { id: any }) => ({ id: item.id }));

  await context.db.CartItem.deleteMany({
    where: [...cartItemsIds],
  });
  return order;
}

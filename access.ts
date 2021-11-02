/* eslint-disable @typescript-eslint/no-unsafe-call */
import { permissionsList } from './schemas/fields';
import { ListAccessArgs } from './types';

export const isSignIn = ({ session }: ListAccessArgs): boolean => !!session;
export const isAdmin = ({ session }: ListAccessArgs): boolean =>
  !!(session?.data?.role?.name === 'Admin');

export const permissions = Object.fromEntries(
  permissionsList.map((permission) => [
    permission,
    ({ session }: ListAccessArgs) => !!session?.data.role?.[permission],
  ])
);

export const rules = {
  canManageUsers({ session }: ListAccessArgs) {
    if (!session) return false;

    if (permissions.canManageUsers({ session })) {
      return true;
    }

    return { id: session.itemId };
  },
  canManageProducts({ session }: ListAccessArgs) {
    if (!session) return false;

    if (permissions.canManageProducts({ session })) {
      return true;
    }

    return { user: { id: session.itemId } };
  },
  canOrder({ session }: ListAccessArgs) {
    if (!session) return false;

    if (permissions.canManageCart({ session })) {
      return true;
    }

    return { user: { id: session.itemId } };
  },
  canManageOrderItem({ session }: ListAccessArgs) {
    if (!session) return false;

    if (permissions.canManageCart({ session })) {
      return true;
    }

    return { order: { user: { id: session.itemId } } };
  },
  canReadProducts({ session }: ListAccessArgs) {
    if (!session) return { status: 'AVAILABLE' };

    if (permissions.canManageProducts({ session })) {
      return true;
    }
    return { OR: [{ status: 'AVAILABLE' }, { user: { id: session.itemId } }] };
  },
};

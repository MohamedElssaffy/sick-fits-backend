import { createAuth } from '@keystone-next/auth';

import { statelessSessions } from '@keystone-next/keystone/session';

import { sendResetPasswordToken } from './lib/mail';
import { permissionsList } from './schemas/fields';

let sessionSecret = process.env.COOKIE_SECRET;

if (!sessionSecret) {
  if (process.env.NODE_ENV === 'production') {
    throw new Error(
      'The SESSION_SECRET environment variable must be set in production'
    );
  } else {
    sessionSecret = '-- DEV COOKIE SECRET; CHANGE ME --';
  }
}

const { withAuth } = createAuth({
  listKey: 'User',
  identityField: 'email',
  sessionData: `id name role {${permissionsList.join(' ')}}`,
  secretField: 'password',
  initFirstItem: {
    fields: ['name', 'email', 'password'],
  },

  passwordResetLink: {
    async sendToken({ identity, token }) {
      await sendResetPasswordToken(identity, token);
    },
  },
});

let sessionMaxAge = 60 * 60 * 24 * 30;

const session = statelessSessions({
  maxAge: sessionMaxAge,
  secret: sessionSecret!,
  sameSite: false,
});

export { withAuth, session };

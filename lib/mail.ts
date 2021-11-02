import { createTransport, getTestMessageUrl } from 'nodemailer';

const transporter = createTransport({
  host: process.env.MAIL_HOST,
  port: process.env.MAIL_PORT,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

const makeEmailHtml = (text: string): string => `
		<div style="
			border: 1px solid black;
			padding: 20px;
			font-size: 20px;
			font-family: sans-serif;
		">
			<h2>Hello</h2>
			<p>${text}</p>
		</div>
	`;

export interface Envelope {
  from: string;
  to?: string[] | null;
}
export interface MailResponse {
  accepted?: string[] | null;
  rejected?: null[] | null;
  envelopeTime: number;
  messageTime: number;
  messageSize: number;
  response: string;
  envelope: Envelope;
  messageId: string;
}

export const sendResetPasswordToken = async (
  to: string,
  resetToken: string
): Promise<void> => {
  const info = (await transporter.sendMail({
    to,
    from: 'mohamed@example.com',
    subject: 'Reset Password',
    html: makeEmailHtml(`
			 <a href=${process.env.FRONTEND_URL}/reset?token=${resetToken}> Click here to reset your password</a>`),
  })) as MailResponse;

  if (process.env.MAIL_USER.includes('ethereal.email')) {
    console.log(getTestMessageUrl(info));
  }
};

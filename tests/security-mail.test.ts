import assert from 'node:assert/strict';
import test from 'node:test';
import nodemailer from '../apps/api/node_modules/nodemailer/dist/cjs/nodemailer.js';
import { sendResetPasswordEmail } from '../apps/api/src/services/mail';

test('reset email keeps its envelope and HTML using the upgraded offline Nodemailer transport', async () => {
  const previous = { ...process.env };
  const createTransport = nodemailer.createTransport;
  const log = console.log;
  let configuration: unknown;
  let message: { to: { address: string }[]; html: string; subject: string } | undefined;
  try {
    Object.assign(process.env, { SMTP_HOST: 'smtp.mail.invalid', SMTP_USER: 'sender@mail.invalid', SMTP_PASS: 'fixture-pass-only', SMTP_PORT: '465' });
    nodemailer.createTransport = ((options: unknown) => {
      configuration = options;
      const transport = createTransport({ jsonTransport: true });
      return {
        sendMail: async (mail: Parameters<typeof transport.sendMail>[0]) => {
          const result = await transport.sendMail(mail);
          message = JSON.parse(result.message.toString());
          return result;
        },
        close: () => transport.close(),
      };
    }) as unknown as typeof createTransport;
    console.log = () => undefined;
    assert.equal(await sendResetPasswordEmail('recipient@mail.invalid', 'https://app.invalid/reset-password?token=fixture'), true);
    assert.equal((configuration as { secure: boolean }).secure, true);
    assert.deepEqual(message?.to.map(({ address }) => address), ['recipient@mail.invalid']);
    assert.match(message?.html || '', /https:\/\/app\.invalid\/reset-password\?token=fixture/);
    assert.equal(message?.subject, 'Recuperação de Senha - ProSis');
  } finally {
    nodemailer.createTransport = createTransport;
    console.log = log;
    for (const key of ['SMTP_HOST', 'SMTP_USER', 'SMTP_PASS', 'SMTP_PORT']) {
      if (previous[key] === undefined) delete process.env[key]; else process.env[key] = previous[key];
    }
  }
});

test('SMTP failure logs cannot disclose server responses, reset tokens or recipients', async () => {
  const previous = { ...process.env };
  const createTransport = nodemailer.createTransport;
  const errorLog = console.error;
  const captured: unknown[][] = [];
  let closed = false;
  const error = Object.assign(new Error('private-reset-token recipient@mail.invalid smtp-password'), { code: 'EAUTH', responseCode: 535, command: 'AUTH private-reset-token' });
  try {
    Object.assign(process.env, { SMTP_HOST: 'smtp.mail.invalid', SMTP_USER: 'sender@mail.invalid', SMTP_PASS: 'fixture-pass-only', SMTP_PORT: '465' });
    nodemailer.createTransport = (() => ({ sendMail: async () => { throw error; }, close: () => { closed = true; } })) as unknown as typeof createTransport;
    console.error = (...args: unknown[]) => { captured.push(args); };
    await assert.rejects(sendResetPasswordEmail('recipient@mail.invalid', 'https://app.invalid/reset-password?token=private-reset-token'));
    const output = JSON.stringify(captured);
    for (const secret of ['private-reset-token', 'recipient@mail.invalid', 'smtp-password']) assert.equal(output.includes(secret), false);
    assert.match(output, /EAUTH/);
    assert.match(output, /535/);
    assert.equal(closed, true);
  } finally {
    nodemailer.createTransport = createTransport;
    console.error = errorLog;
    for (const key of ['SMTP_HOST', 'SMTP_USER', 'SMTP_PASS', 'SMTP_PORT']) {
      if (previous[key] === undefined) delete process.env[key]; else process.env[key] = previous[key];
    }
  }
});

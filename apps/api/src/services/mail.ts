import nodemailer from "nodemailer";

const SMTP_PLACEHOLDERS = [
  "exemplo",
  "example",
  "seusite",
  "seudominio",
  "seu-dominio",
  "change-me",
  "substitua",
  "suasenha",
];

function readRequiredSmtpVariable(name: "SMTP_HOST" | "SMTP_USER" | "SMTP_PASS") {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(`Configuração SMTP incompleta: defina ${name}.`);
  }

  const normalizedValue = value.toLowerCase();
  if (SMTP_PLACEHOLDERS.some((placeholder) => normalizedValue.includes(placeholder))) {
    throw new Error(`Configuração SMTP inválida: ${name} ainda contém um valor de exemplo.`);
  }

  return value;
}

function getSmtpConfiguration() {
  const host = readRequiredSmtpVariable("SMTP_HOST");
  const user = readRequiredSmtpVariable("SMTP_USER");
  const pass = readRequiredSmtpVariable("SMTP_PASS");
  const port = Number(process.env.SMTP_PORT?.trim() || "465");

  if (!Number.isInteger(port) || port <= 0 || port > 65535) {
    throw new Error("Configuração SMTP inválida: SMTP_PORT deve ser uma porta válida.");
  }

  return { host, port, user, pass };
}

function smtpErrorDetails(error: unknown) {
  if (!(error instanceof Error)) {
    return { message: String(error) };
  }

  const smtpError = error as Error & {
    code?: string;
    command?: string;
    responseCode?: number;
  };

  return {
    name: smtpError.name,
    message: smtpError.message,
    code: smtpError.code,
    command: smtpError.command,
    responseCode: smtpError.responseCode,
  };
}

export async function sendResetPasswordEmail(to: string, resetLink: string) {
  const { host, port, user, pass } = getSmtpConfiguration();
  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
    connectionTimeout: 15_000,
    greetingTimeout: 10_000,
    socketTimeout: 30_000,
  });

  try {
    const info = await transporter.sendMail({
      from: {
        name: process.env.SMTP_FROM_NAME?.trim() || "ProSis",
        address: user,
      },
      to,
      subject: "Recuperação de Senha - ProSis",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
          <h2 style="color: #345ce2;">Recuperação de Senha</h2>
          <p>Olá,</p>
          <p>Recebemos uma solicitação para redefinir a senha associada a este e-mail no sistema <strong>ProSis</strong>.</p>
          <p>Se você não solicitou isso, pode ignorar este e-mail com segurança.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetLink}" style="background-color: #345ce2; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">
              Redefinir Minha Senha
            </a>
          </div>
          <p style="font-size: 14px; color: #777;">
            Se o botão acima não funcionar, copie e cole o link abaixo no seu navegador:<br>
            <a href="${resetLink}">${resetLink}</a>
          </p>
          <hr style="border: none; border-top: 1px solid #eaeaea; margin: 30px 0;" />
          <p style="font-size: 12px; color: #999; text-align: center;">
            ProSis - Gestão do Programa Jovem Aprendiz<br>
            Este é um e-mail automático, não responda.
          </p>
        </div>
      `,
    });

    console.log("E-mail de recuperação enviado:", info.messageId);
    return true;
  } catch (error) {
    console.error("Erro ao enviar e-mail de recuperação:", smtpErrorDetails(error));
    throw error;
  } finally {
    transporter.close();
  }
}

import nodemailer from 'nodemailer';
export const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.hostinger.com',
  port: Number(process.env.SMTP_PORT) || 465, 
  secure: true, // true para 465, false para outras portas (ex: 587)
  auth: {
    user: process.env.SMTP_USER || 'contato@seusite.com', 
    pass: process.env.SMTP_PASS || 'SuaSenha123*',      
  },
});
export async function sendResetPasswordEmail(to: string, resetLink: string) {
  try {
    const info = await transporter.sendMail({
      from: `"ProSis" <${process.env.SMTP_USER || 'contato@seusite.com'}>`, 
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
    console.error("Erro ao enviar e-mail de recuperação:", error);
    throw error;
  }
}

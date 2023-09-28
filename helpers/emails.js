import nodemailer from "nodemailer";

export const emailRegistro = async (datos) => {
  const { email, nombre, token } = datos

  const transport = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  //Informacion del email
  const info = await transport.sendMail({
    from: '"Uptask - administrador de proyectos" <cuentas@uptask.com>',
    to: email,
    subject: "Registro de usuario",
    text: "Comprueba tu cuenta en uptask",
    html: `
        <p>Hola: ${nombre} Comprueba tu cuenta en uptask</p>
        <p>Tu cuenta ya esta casi lista, solo debes comprobarla en el siguiente enlace:</p>
        <a href="${process.env.FRONTEND_URL}/confirmar/${token}">Comprobar cuenta</a>
        <p>Si tu no creaste esta cuenta, puedes ignorar el mensaje</p>
        `
  })
}

export const emailOlvidePassword = async (datos) => {
  const { email, nombre, token } = datos
  const transport = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  //Informacion del email
  const info = await transport.sendMail({
    from: '"Uptask - administrador de proyectos" <cuentas@uptask.com>',
    to: email,
    subject: "Uptask - Reestablece tu password",
    text: "Reestablece tu password",
    html: `
        <p>Hola: ${nombre} has solicitado reestablecer tu password</p>
        <p>Sigue el siguiente enlace para generar un nuevo password: </p>
        <a href="${process.env.FRONTEND_URL}/olvide-password/${token}">Reestablecer password</a>
        <p>Si tu no solicitaste el email, puedes ignorar el mensaje</p>
        `
  })
}
import nodemailer from "nodemailer";

export const emailRegistro =async  (datos) => {
  const { nombre, email, token } = datos;
  const transport = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port:process.env.EMAIL_PORT ,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  //? Informacion del email
  const info = await transport.sendMail({
      from:'"UpTask- Administrador de proyectos" <cuentas@uptask.com',
      to:email,
      subject:"UpTask-Comprueba tu cuenta",
      text: "Comprueba tu cuenta en UpTask",
      html:
      `
        <p>Hola ${nombre} comprueba tu cuenta en UpTask </p>
        <p>
            Tu cuenta ya esta casi lista solo debes comprobarla en el siguiente enlace: 
            <a href="${process.env.FRONTEND_URL}/confirmar/${token}">Comprobar cuenta</a>

        </p>

        <p>Si tu no creaste esta cuenta, puedes ignorar el mensaje</p>
      `
  })
};




export const emailOlvidePassword =async  (datos) => {
  const { nombre, email, token } = datos;
  //todo: mover a variables de entorno
  const transport = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port:process.env.EMAIL_PORT ,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  //? Informacion del email
  const info = await transport.sendMail({
      from:'"UpTask- Administrador de proyectos" <cuentas@uptask.com',
      to:email,
      subject:"UpTask-Reestablece tu Password",
      text: "Reestablece tu Password",
      html:
      `
        <p>Hola ${nombre}, Has solicitado reestablecer tu Password en UpTask </p>
        <p>
            Sigue el siguiente enlace para generar un nuevo password: 
            <a href="${process.env.FRONTEND_URL}/olvide-password/${token}">Reestablecer Password</a>

        </p>

        <p>Si tu no solicitaste un cambio de contraseña, puedes ignorar el mensaje</p>
      `
  })
};

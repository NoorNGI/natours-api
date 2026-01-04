import nodemailer from "nodemailer";

export const sendEmail = async (options) => {
  // 1). CREATE A TRANSPORTER...
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  //2 ) DEFINE EMAIL OPTIONS...
  const mailOptions = {
    from: "Natours <no-reply@natours.io>",
    to: options.email,
    subject: options.subject,
    text: options.message,
  };

  // 3) SEND EMAIL WITH NODEMAILER
  await transporter.sendMail(mailOptions);
};

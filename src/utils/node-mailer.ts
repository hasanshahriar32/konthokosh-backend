import nodemailer from 'nodemailer';
import { FROM_EMAIL, PASSWORD } from '../configs/envConfig';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: FROM_EMAIL,
    pass: PASSWORD,
  },
});

async function sendEmail(mailOptions: any) {
  return transporter.sendMail(mailOptions);
}

export default sendEmail;

import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class MailService {
  private transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: Number(process.env.MAIL_PORT),
    secure: false,
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASSWORD,
    },
  });

  private renderTemplate(
    templateName: string,
    variables: Record<string, string>,
  ): string {
    const templatePath = path.join(
      process.cwd(),
      'src',
      'mail',
      'templates',
      `${templateName}.html`,
    );

    let html = fs.readFileSync(templatePath, 'utf8');

    for (const [key, value] of Object.entries(variables)) {
      html = html.replaceAll(`{{${key}}}`, value);
    }

    return html;
  }

  async sendEmail(
    to: string,
    subject: string,
    templateName: string,
    variables: Record<string, string>,
  ) {
    const html = this.renderTemplate(
      templateName,
      variables,
    );

    return this.transporter.sendMail({
      from: `"Afghan Areya Bank" <${process.env.MAIL_FROM}>`,
      to,
      subject,
      html,
    });
  }
}
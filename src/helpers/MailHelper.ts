import * as fs from 'fs';
import * as nodeMailer from 'nodemailer';
import * as emailExistence from 'email-existence';

/**
 * Need config google account before use it
 * https://myaccount.google.com/u/2/lesssecureapps?pli=1&pageId=none
 * https://accounts.google.com/b/0/DisplayUnlockCaptcha
 */

export default class MailHelper {
    private static transporter: nodeMailer.Transporter = nodeMailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.SMTP_AUTHENTICATOR_USERNAME,
            pass: process.env.SMTP_AUTHENTICATOR_PASSWORD
        }
    });

    static sendMail(email: string, subject: string, text?: string, html?: string): Promise<nodeMailer.SentMessageInfo> {
        return this.transporter.sendMail({
            from: `${process.env.SMTP_SENDER_NAME} <${process.env.SMTP_SENDER_EMAIL}>`, // sender address
            to: email, // list of receivers
            subject: subject, // Subject line
            text: text, // plain text body
            html: html // html body
        });
    }

    static sendMailAdvanced(fromEmail: string, fromName: string, emails: string | string[], subject: string, text?: string, html?: string): Promise<nodeMailer.SentMessageInfo> {
        return MailHelper.transporter.sendMail({
            from: `${fromName} <${fromEmail}>`, // sender address
            to: Array.isArray(emails) && emails.length > 0 ? emails.join(', ') : emails, // list of receivers
            subject: subject, // Subject line
            text: text, // plain text body
            html: html // html body
        });
    }

    static loadMailTemplate(path, param) {
        let content = fs.readFileSync(path, 'utf8');
        if (param) {
            Object.keys(param).forEach(key => {
                content = content.replace(new RegExp(`{{${key}}}`, 'g'), param[key]);
            });
        }
        return content;
    }

    static checkRealEmail(email: string): Promise<boolean> {
        return new Promise((resolve, reject) => {
            emailExistence.check(email, (error, response) => {
                if (error) {
                    console.error(error);
                    resolve(false);
                }
                resolve(response);
            });
        });
    }
}

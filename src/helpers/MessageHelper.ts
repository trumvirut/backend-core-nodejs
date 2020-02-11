import * as Twilio from 'twilio';

const accountSid = 'ACa082b9f96d5c781898a6b6757a41983b';
const authToken = '5318eda324f2f509a04d17c7a58e20f1';
const client = Twilio(accountSid, authToken);

export default class MessageHelper {
    static async sendMessage(from: string, to: string, text?: string): Promise<void> {
        return client.messages
            .create({
                to: `whatsapp:+${to}`,
                from: from,
                body: text
            })
            .then((message) => console.log('===========>', message.sid))
            .catch((err) => console.log('err ========>', err));
    }
};

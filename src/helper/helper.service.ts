import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import axios from 'axios';

interface SendImageBody {
    image: string;
    caption: string;
}

@Injectable()
export class HelperService {
    async sendImageMessage(phoneNumber: string, sendImageBody: SendImageBody) {
        try {
            const { data } = await axios.post(
                `http://localhost:5000/chat/sendimage/55${phoneNumber}`,
                sendImageBody,
            );

            return data;
        } catch (error) {
            throw new HttpException(
                `Error while sending image message, ${error}`,
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }
}

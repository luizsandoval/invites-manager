import { Injectable, HttpStatus, HttpException } from '@nestjs/common';

import { HelperService } from 'src/helper/helper.service';

import { createCanvas, loadImage, NodeCanvasRenderingContext2D } from 'canvas';

import path = require('path');
import excelToJson = require('convert-excel-to-json');

@Injectable()
export class InvitesService {
    constructor(private readonly helperService: HelperService) {}

    async sendRemind(guestsWorksheet: Express.Multer.File) {
        try {
            const { Convidados: guests } = excelToJson({
                source: guestsWorksheet.buffer,
                header: {
                    rows: 1,
                },
                columnToKey: {
                    A: 'name',
                    B: 'inviteStatus',
                    C: 'phoneNumber',
                },
                sheets: ['Convidados'],
            });

            const currentDay = new Date().getDate();
            const marriageDay = 30;

            const daysLeft = marriageDay - currentDay;

            for await (const guest of guests) {
                const caption = `
Olá, *${guest.name}*,

Estamos enviando esta mensagem para lembrá-lo que faltam apenas *${daysLeft} ${
                    daysLeft > 1 ? 'dias' : 'dia'
                }* para o *nosso casamento*!

Se você ainda não confirmou a sua presença, por favor, acesse o endereço abaixo e confirme:
https://docs.google.com/forms/d/1uA4Lm1Ki2Qpnpv4maeW1Bm3FOW-AM3KrVJpHK8G6Kpc

*Lista de presentes* 🎁
https://listas.pontofrio.com.br/martaeluiz

Contamos com a sua presença❤️

--------------------------------------------------------

*Marta & Luiz* 💍🌹

*Data* 🗓️
30/01/2022

*Horário* ⏰
Cerimônia à partir das 13h
Recepção das 14h às 20h

*Local* 📍
Espaço Família
Av. Dona Belmira Marin, 5485
`;

                const inviteImage = await this.generateInvite(guest.name);

                const response = await this.helperService.sendImageMessage(
                    guest.phoneNumber,
                    {
                        caption,
                        image: inviteImage.toString('base64'),
                    },
                );

                guest.sent = response.status !== 'error';
            }

            return guests;
        } catch (error) {
            throw new HttpException(
                `Error while sending invites ${error}`,
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    async generateInvite(guestName: string) {
        try {
            const width = 1200;
            const height = 1800;
            const canvas = createCanvas(width, height);
            const context = canvas.getContext('2d');

            context.textAlign = 'center';
            context.textBaseline = 'top';
            context.fillStyle = '#595B3F';
            context.font = "4.5rem 'Dancing Script OT'";

            const wrapText = (
                context: NodeCanvasRenderingContext2D,
                text: string,
                x: number,
                y: number,
                maxWidth: number,
                lineHeight: number,
            ) => {
                const words = text.split(' ');
                let line = '';
                let isMultipleLine = false;

                for (let n = 0; n < words.length; n++) {
                    const testLine = line + words[n] + ' ';
                    const metrics = context.measureText(testLine);
                    const testWidth = metrics.width;

                    if (testWidth > maxWidth && n > 0) {
                        context.fillText(line, x, y);
                        line = words[n] + ' ';
                        y += lineHeight;
                        isMultipleLine = true;
                    } else {
                        line = testLine;
                    }
                }
                context.fillText(line, x, isMultipleLine ? y : height / 2);
            };

            const y = 880;
            const x = width / 2;
            const maxWidth = 800;
            const lineHeight = 100;

            const templateImage = await loadImage(
                path.resolve(__dirname, '..', '..', 'assets', 'template.jpg'),
            );

            context.drawImage(templateImage, 0, 0, width, height);

            wrapText(context, guestName, x, y, maxWidth, lineHeight);

            const buffer = canvas.toBuffer('image/jpeg');

            return buffer;
        } catch (error) {
            throw new HttpException(
                `Error while generating invite, ${error}`,
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }
}

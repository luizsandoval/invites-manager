import {
    Get,
    Res,
    Post,
    Param,
    HttpStatus,
    Controller,
    UploadedFile,
    UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';

import { InvitesService } from './invites.service';

@Controller('invites')
export class InvitesController {
    constructor(private readonly invitesService: InvitesService) {}

    @Post('/remind')
    @UseInterceptors(FileInterceptor('guestsWorksheet'))
    async send(
        @Res() res: Response,
        @UploadedFile() guestsWorksheet: Express.Multer.File,
    ) {
        try {
            const sentInvites = await this.invitesService.sendRemind(
                guestsWorksheet,
            );

            res.status(HttpStatus.OK).json(sentInvites);
        } catch (error) {
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(error);
        }
    }

    @Get('/guest/:guestName')
    async getOne(@Res() res: Response, @Param('guestName') guestName: string) {
        try {
            const invite = await this.invitesService.generateInvite(guestName);

            res.set({ 'Content-Type': 'image/png' });
            res.send(invite);
        } catch (error) {
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(error);
        }
    }
}

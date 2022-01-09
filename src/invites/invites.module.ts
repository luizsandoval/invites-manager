import { Module } from '@nestjs/common';
import { HelperService } from 'src/helper/helper.service';
import { InvitesController } from './invites.controller';
import { InvitesService } from './invites.service';

@Module({
    controllers: [InvitesController],
    providers: [InvitesService, HelperService],
})
export class InvitesModule {}

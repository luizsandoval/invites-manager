import { Module } from '@nestjs/common';

import { HelperService } from './helper/helper.service';

import { InvitesModule } from './invites/invites.module';

@Module({
    imports: [InvitesModule],
    providers: [HelperService],
})
export class AppModule {}

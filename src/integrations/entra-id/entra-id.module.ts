import { Global, Module } from '@nestjs/common';

import { EntraIdService } from './entra-id.service';

@Global()
@Module({
    providers: [EntraIdService],
    exports: [EntraIdService],
})
export class EntraIdModule {}

import { Global, Module } from '@nestjs/common';

import { OneLoginService } from './one-login.service';

@Global()
@Module({
    providers: [OneLoginService],
    exports: [OneLoginService],
})
export class OneLoginModule {}

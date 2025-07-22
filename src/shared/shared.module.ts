import { Module } from "@nestjs/common";

import { TokenEncryptionUtil } from "./utils/token-encryption.util";

@Module({
  providers: [TokenEncryptionUtil],
  exports: [TokenEncryptionUtil],
})
export class SharedModule {}

import { PartialType } from "@nestjs/swagger";

import { CreateUserPositionDto } from "./create-user-position.dto";

export class UpdateUserPositionDto extends PartialType(CreateUserPositionDto) {}

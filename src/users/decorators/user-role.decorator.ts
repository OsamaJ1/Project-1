import { SetMetadata } from "@nestjs/common";
import { userType } from "../../utils/constants";

export const Roles = (...roles: userType[]) => SetMetadata('roles',roles);
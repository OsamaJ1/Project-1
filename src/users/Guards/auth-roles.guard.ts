import { CanActivate, ExecutionContext, Injectable, UnauthorizedException, UseGuards } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { Request } from "express";
import { JWTPayloadType } from "../../utils/types";
import { CURRENT_USER_KEY, userType } from "../../utils/constants";
import { Reflector } from "@nestjs/core";
import { Roles } from "../decorators/user-role.decorator";
import { UsersService } from "../users.service";

@Injectable()
export class AuthRolesGuard implements CanActivate{
    
    
    constructor(private readonly jwtService:JwtService,
                private readonly configService:ConfigService,
                private readonly refloctor:Reflector,
                private readonly userService: UsersService
    ){}
    
    async canActivate(context: ExecutionContext) {
        
        const roles : userType[]=this.refloctor.getAllAndOverride('roles',[context.getHandler(),context.getClass()])
        if(!roles||roles.length===0) return false;

        const request :Request=context.switchToHttp().getRequest();
        const [type,token] = request.headers.authorization?.split(" ") ?? [];
        if(token&& type=="Bearer"){

            try {
                const payLoad:JWTPayloadType= await this.jwtService.verifyAsync(
                token,{
                    secret: this.configService.get<string>("JWT_SECRET")
                }
            );

            const user= await this.userService.getCurrentUser(payLoad.id)
            if(!user) return false;

            if(roles.includes(user.userType)){
                request [CURRENT_USER_KEY]=payLoad;
                return true;
            }

        
            } catch (error) {
                throw new UnauthorizedException("Invalide toke")
            }
        }
        else{
             throw new UnauthorizedException("Invalid toke")
        }
        return false;
    }

}
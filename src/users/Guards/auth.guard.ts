import { CanActivate, ExecutionContext, Injectable, UnauthorizedException, UseGuards } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { Request } from "express";
import { JWTPayloadType } from "../../utils/types";
import { CURRENT_USER_KEY } from "../../utils/constants";

@Injectable()
export class AuthGuard implements CanActivate{
    
    
    constructor(private readonly jwtService:JwtService,
                private readonly configService:ConfigService
    ){}
    
    async canActivate(context: ExecutionContext) {
        const request :Request=context.switchToHttp().getRequest();
        const [type,token] = request.headers.authorization?.split(" ") ?? [];
        if(token&& type=="Bearer"){

            try {
                const payLoad:JWTPayloadType= await this.jwtService.verifyAsync(
                token,{
                    secret: this.configService.get<string>("JWT_SECRET")
                }
            )
        request [CURRENT_USER_KEY]=payLoad;
            } catch (error) {
                throw new UnauthorizedException("Invalide toke")
            }
        }
        else{
             throw new UnauthorizedException("Invalid toke")
        }
        return true;
    }

}
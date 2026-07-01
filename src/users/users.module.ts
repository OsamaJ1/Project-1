// To let nest know this is a module:
import { Module,forwardRef } from "@nestjs/common";
import { UsersController } from "./users.controller";
import { UsersService } from "./users.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "./user.entity";
import { JwtModule } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";


@Module({
    controllers: [UsersController],
    providers: [UsersService],
    exports: [UsersService, JwtModule],
    imports:[
        
        TypeOrmModule.forFeature([User]),
        JwtModule.registerAsync({
            inject:[ConfigService],
            useFactory:(config:ConfigService)=>{ 
                return{
                    global:true,
                    secret:config.get<string>("JWT_ACCESS_SECRET"),
                    signOptions:{expiresIn:config.get<string>("JWT_ACCESS_EXPIRES_IN") as any}
                }
            }})
    ]
        
})
export class UsersModule{
    
} 
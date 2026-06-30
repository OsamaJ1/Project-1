import { Body, Controller, Get, HttpCode, HttpStatus, Post,Headers, UseGuards,Req } from "@nestjs/common";
import { UsersService } from "./users.service";
import { RegisterDto } from "./dtos/register.dto";
import { LoginDto } from "./dtos/login.dto";
import { get, request } from "http";
import { AuthGuard } from "./Guards/auth.guard";
import {CURRENT_USER_KEY} from "../utils/constants";
import { importOrRequireFile } from "typeorm/browser/util/ImportUtils.js";
import { CurrentUser } from "./decorators/current-user.decorator";
import type { JWTPayloadType } from "../utils/types";
import { retry } from "rxjs";
import { Roles } from "./decorators/user-role.decorator";
import { userType } from "../utils/constants";
import { AuthRolesGuard } from "./Guards/auth-roles.guard";

@Controller("api/users")
export class UsersController{

    constructor(
        private readonly usersService: UsersService,
        
    ){}

    @Post("auth/register")
    public register(@Body() body:RegisterDto){
        return this.usersService.register(body);

    }

    @Post("auth/login")
    @HttpCode(HttpStatus.OK)
    public login(@Body() body:LoginDto){
        return this.usersService.login(body);

    }

    @Get("current-user")
    @UseGuards(AuthGuard)
    public getCurrentUser(@CurrentUser() payload:JWTPayloadType){
        //const payLoad = request[CURRENT_USER_KEY];
        return this.usersService.getCurrentUser(payload.id);
        
    }

    //To get all users
    @Get()
    @Roles(userType.NORMAL_USER)
    @UseGuards(AuthRolesGuard)
    public getAllUsers(){
        return this.usersService.getAll();
    }



}
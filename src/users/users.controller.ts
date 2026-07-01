import { Body, Controller, Get, HttpCode, HttpStatus, Post, UseGuards } from "@nestjs/common";
import { UsersService } from "./users.service";
import { RegisterDto } from "./dtos/register.dto";
import { LoginDto } from "./dtos/login.dto";
import { RefreshTokenDto } from "./dtos/refresh-token.dto";
import { AuthGuard } from "./Guards/auth.guard";
import { CurrentUser } from "./decorators/current-user.decorator";
import type { JWTPayloadType } from "../utils/types";
import { Roles } from "./decorators/user-role.decorator";
import { userType } from "../utils/constants";
import { AuthRolesGuard } from "./Guards/auth-roles.guard";

@Controller("api/users")
export class UsersController {

    constructor(
        private readonly usersService: UsersService,
    ) { }

    /** Register a new user 
     *  returns access token + refresh token */
    @Post("auth/register")
    public register(@Body() body: RegisterDto) {
        return this.usersService.register(body);
    }

    /** Login 
     *  returns access token + refresh token */
    @Post("auth/login")
    @HttpCode(HttpStatus.OK)
    public login(@Body() body: LoginDto) {
        return this.usersService.login(body);
    }

    /**
     * Refresh tokens
     * validates the refresh token
     *  returns a new access token + refresh token pair
     */
    @Post("auth/refresh")
    @HttpCode(HttpStatus.OK)
    public refreshTokens(@Body() body: RefreshTokenDto) {
        return this.usersService.refreshTokens(body.refreshToken);
    }

    /** Logout 
     *  revokes the stored refresh token for the current user */
    @Post("auth/logout")
    @HttpCode(HttpStatus.OK)
    @UseGuards(AuthGuard)
    public logout(@CurrentUser() payload: JWTPayloadType) {
        return this.usersService.logout(payload.id);
    }

    /** Get the current authenticated user's info */
    @Get("current-user")
    @UseGuards(AuthGuard)
    public getCurrentUser(@CurrentUser() payload: JWTPayloadType) {
        return this.usersService.getCurrentUser(payload.id);
    }

    /** Get all users  
     * admin only */
    @Get()
    @Roles(userType.ADMIN)
    @UseGuards(AuthRolesGuard)
    public getAllUsers() {
        return this.usersService.getAll();
    }

}
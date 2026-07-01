import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { RegisterDto } from "./dtos/register.dto";
import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "./user.entity";
import * as bcrypt from 'bcryptjs';
import { LoginDto } from "./dtos/login.dto";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import { userType } from "../utils/constants";
import { JWTPayloadType, AccessTokenType, AuthTokensType } from "../utils/types";


@Injectable()
export class UsersService {

    constructor(
        @InjectRepository(User) private readonly usersRepository: Repository<User>,
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService,
    ) { }

    public async register(registerDto: RegisterDto): Promise<AuthTokensType> {
        const { email, password, username } = registerDto;

        const userFromDb = await this.usersRepository.findOne({ where: { email } });
        if (userFromDb) throw new BadRequestException("User already exists");

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        let newUser = this.usersRepository.create({
            email,
            username,
            password: hashedPassword,
        });

        newUser = await this.usersRepository.save(newUser);

        const payload: JWTPayloadType = { id: newUser.id, userType: newUser.userType };
        return this.generateTokens(payload);
    }


    public async login(loginDto: LoginDto): Promise<AuthTokensType> {
        const { email, password } = loginDto;

        const user = await this.usersRepository.findOne({ where: { email } });
        if (!user) throw new BadRequestException("Invalid email or password");

        const isPasswordMatch = await bcrypt.compare(password, user.password);
        if (!isPasswordMatch) throw new BadRequestException("Invalid email or password");

        const payload: JWTPayloadType = { id: user.id, userType: user.userType };
        return this.generateTokens(payload);
    }


    /**
     * Validate the incoming refresh token, rotate it, and return a new pair of tokens.
     * The refresh token is verified against the JWT_REFRESH_SECRET to extract the userId,
     * then compared against the stored hash. This works even when the access token has expired.
     * @param incomingRefreshToken  raw refresh token sent by the client
     */
    public async refreshTokens(incomingRefreshToken: string): Promise<AuthTokensType> {
        let payload: JWTPayloadType;

        // Step 1: Verify the refresh token's signature and expiry
        try {
            payload = await this.jwtService.verifyAsync<JWTPayloadType>(incomingRefreshToken, {
                secret: this.configService.get<string>("JWT_REFRESH_SECRET"),
            });
        } catch {
            throw new UnauthorizedException("Invalid or expired refresh token");
        }

        // Step 2: Load the user and compare the hash
        const user = await this.usersRepository.findOne({ where: { id: payload.id } });
        if (!user || !user.refreshToken) {
            throw new UnauthorizedException("Access denied — please log in again");
        }

        const isRefreshTokenValid = await bcrypt.compare(incomingRefreshToken, user.refreshToken);
        if (!isRefreshTokenValid) {
            throw new UnauthorizedException("Invalid or expired refresh token");
        }

        const freshPayload: JWTPayloadType = { id: user.id, userType: user.userType };
        return this.generateTokens(freshPayload);
    }


    /**
     * Invalidate the refresh token (logout).
     * @param userId  id of the user to log out
     */
    public async logout(userId: number): Promise<{ message: string }> {
        await this.usersRepository.update({ id: userId }, { refreshToken: null });
        return { message: "Logged out successfully" };
    }


    /**
     * Get current user by id.
     * @param id  id of the user
     * @returns user from database
     */
    public async getCurrentUser(id: number): Promise<User> {
        const user = await this.usersRepository.findOne({ where: { id } });
        if (!user) throw new NotFoundException("User not found");
        return user;
    }


    /** Get all users from DB */
    public getAll(): Promise<User[]> {
        return this.usersRepository.find();
    }


    /**
     * Generate a new access token + refresh token pair, hash and persist the refresh token.
     * @param payload  JWT payload
     * @returns both tokens
     */
    private async generateTokens(payload: JWTPayloadType): Promise<AuthTokensType> {
        const [accessToken, refreshToken] = await Promise.all([
            this.jwtService.signAsync(payload, {
                secret: this.configService.get<string>("JWT_ACCESS_SECRET"),
                expiresIn: this.configService.get("JWT_ACCESS_EXPIRES_IN") as any,
            }),
            this.jwtService.signAsync(payload, {
                secret: this.configService.get<string>("JWT_REFRESH_SECRET"),
                expiresIn: this.configService.get("JWT_REFRESH_EXPIRES_IN") as any,
            }),
        ]);

        // Hash and store the refresh token — never store the raw value
        const salt = await bcrypt.genSalt(10);
        const hashedRefreshToken = await bcrypt.hash(refreshToken, salt);
        await this.usersRepository.update({ id: payload.id }, { refreshToken: hashedRefreshToken });

        return { accessToken, refreshToken };
    }

}
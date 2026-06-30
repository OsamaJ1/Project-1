import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { RegisterDto } from "./dtos/register.dto";
import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "./user.entity";
import * as bcrypt from 'bcryptjs';
import { LoginDto } from "./dtos/login.dto";
import { JwtService } from "@nestjs/jwt";
import { userType } from "../utils/constants";
import {JWTPayloadType,AccessTokenType} from "../utils/types";
import { promises } from "dns";
import { ConfigService } from "@nestjs/config";


@Injectable()
export class UsersService{
    
    constructor(
        @InjectRepository(User) private readonly usuersRepository:Repository<User>,
        private readonly jwtService: JwtService,
        
    ){}

    public async register(registerDto:RegisterDto):Promise<AccessTokenType>{ //Promise cuz async

        const{email,password,username} =registerDto;
        const userFromDb= await this.usuersRepository.findOne({where:{email}})
        if(userFromDb) throw new BadRequestException("User already exist");

        const salt = await bcrypt.genSalt(10);
        const hashedpassword= await bcrypt.hash(password,salt);

        let newUser = this.usuersRepository.create({
            email,
            username,
            password:hashedpassword,
        })
        
        newUser= await this.usuersRepository.save(newUser);

        const payLoad :JWTPayloadType = {id:newUser.id,userType:newUser.userType};
        const accessToken= await this.generateJWT(payLoad);
        return {accessToken};
    }


    public async login(loginDto:LoginDto): Promise<AccessTokenType>{
        const {email,password}=loginDto;

        const user = await this.usuersRepository.findOne({where:{email}})
        if(!user) throw new BadRequestException("Invalide email or password");


        const isPasswordMatch = await bcrypt.compare(password,user.password);
        if(!isPasswordMatch) throw new BadRequestException("INVALID PWWW")
        
     
        
        const payLoad : JWTPayloadType = {id:user.id,userType:user.userType};
        const accessToken= await this.generateJWT(payLoad);
        return {accessToken}


        //return user;


    }

    
    
    /**
     * get current user
     * @param id  id of the user
     * @returns return user from data base
     */
    
    public async getCurrentUser(id:number): Promise<User>{
        // const [type,token]=bearerToken.split(" ");
        // const payLoad = await this.jwtService.verifyAsync(token,
        //     {secret: this.config.get<string>("JWT_SECRET")}
        //);// to decrypt toke
        const user = await this.usuersRepository.findOne({where:{id}})
        if(!user) throw new NotFoundException("USer not found")
            return user;
    }

    //To get all user from db
    public getAll(): Promise <User[]>{
        return this.usuersRepository.find()
    }
    
    
    
    
    
    
    /**
     * Generate json webtoken
     * @param payLoad JWT payload
     * @returns token
     */
    
    private generateJWT(payLoad:JWTPayloadType):Promise<string>{
        return this.jwtService.signAsync(payLoad);
        // const payLoad:JWTPayloadType = {id:newUser.id,userType:newUser.userType};
        // const accessToken= await this.jwtService.signAsync(payLoad);
    }


}
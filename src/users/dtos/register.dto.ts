import { IsEmail, IsNotEmpty, IsOptional, IsString, Length, MaxLength, MinLength } from "class-validator";

export class RegisterDto{
    @IsEmail()
    @IsNotEmpty()
    @MaxLength(250)
    email!: string;
    
    @IsString()
    @MinLength(6)
    @IsNotEmpty()
    password!:string;

    @IsString()
    @IsOptional()
    @Length(2,150)
    username?:string
}
import {Module} from '@nestjs/common';
import {UsersModule} from './users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { User } from './users/user.entity';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, //to see all files
      envFilePath: `.env.${process.env.NODE_ENV}`
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        return {  
          type: 'postgres',
          database: config.get<string>("DB_DATABASE"),
          username: config.get<string>("DB_USENAME"),
          password: config.get<string>("DB_PASSWORD"),
          port: config.get<number>("DB_PORT"),
          host: 'localhost',
          synchronize: process.env.NODE_ENV !== 'production', //only in development true
          entities: [User]
        }
      }
    }),
    UsersModule,
  ],
  

})
export class AppModule {}
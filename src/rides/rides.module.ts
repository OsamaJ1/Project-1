import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Ride } from './entities/ride.entity';
import { RidesService } from './rides.service';
import { RidesController } from './rides.controller';
import { UsersModule } from '../users/users.module';

@Module({
    imports: [TypeOrmModule.forFeature([Ride]), UsersModule],
    providers: [RidesService],
    controllers: [RidesController],
})
export class RidesModule { }

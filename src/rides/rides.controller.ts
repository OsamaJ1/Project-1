import { Controller, Post, Patch, Param, UseGuards, Req, ParseIntPipe } from '@nestjs/common';
import { RidesService } from './rides.service';
import { AuthRolesGuard } from '../users/Guards/auth-roles.guard';
import { userType, CURRENT_USER_KEY } from '../utils/constants';
import { Roles } from '../users/decorators/user-role.decorator';

@Controller('rides')
export class RidesController {
    constructor(private readonly ridesService: RidesService) { }

    @Post('request')
    @Roles(userType.PASSANGER)
    @UseGuards(AuthRolesGuard)
    async requestRide(@Req() request: any) {
        const currentUser = request[CURRENT_USER_KEY];
        return this.ridesService.requestRide(currentUser.id);
    }

    @Patch(':id/accept')
    @Roles(userType.DRIVER)
    @UseGuards(AuthRolesGuard)
    async acceptRide(@Param('id', ParseIntPipe) rideId: number, @Req() request: any) {
        const currentUser = request[CURRENT_USER_KEY];
        return this.ridesService.acceptRide(rideId, currentUser.id);
    }

    @Patch(':id/start')
    @Roles(userType.DRIVER)
    @UseGuards(AuthRolesGuard)
    async startRide(@Param('id', ParseIntPipe) rideId: number, @Req() request: any) {
        const currentUser = request[CURRENT_USER_KEY];
        return this.ridesService.startRide(rideId, currentUser.id);
    }

    @Patch(':id/complete')
    @Roles(userType.DRIVER)
    @UseGuards(AuthRolesGuard)
    async completeRide(@Param('id', ParseIntPipe) rideId: number, @Req() request: any) {
        const currentUser = request[CURRENT_USER_KEY];
        return this.ridesService.completeRide(rideId, currentUser.id);
    }

    @Patch(':id/cancel')
    @Roles(userType.PASSANGER, userType.DRIVER)
    @UseGuards(AuthRolesGuard)
    async cancelRide(@Param('id', ParseIntPipe) rideId: number, @Req() request: any) {
        const currentUser = request[CURRENT_USER_KEY];
        return this.ridesService.cancelRide(rideId, currentUser.id);
    }
}

import { Injectable } from '@nestjs/common';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Ride } from './entities/ride.entity';
import { RideStatus } from './enums/ride.enum';
@Injectable()
export class RidesService {
     constructor(
          @InjectRepository(Ride)
          private readonly rideRepository: Repository<Ride>,) { }

     /**
      * Request Ride Method
      * @param passangerId 
      * @returns 
      */
     async requestRide(passangerId: number) {
          const newRide = this.rideRepository.create({
               passangerId: passangerId,
               status: RideStatus.LOOKING_FOR_DRIVER,
               actionById: passangerId
          })
          return await
               this.rideRepository.save(newRide);
     }

     /**
      * 
      * @param rideId 
      * @param driverId 
      * @returns 
      */
     async acceptRide(rideId: number, driverId: number) {

          const ride = await this.rideRepository.findOne({ where: { id: rideId } });
          if (!ride) throw new NotFoundException('Ride not found');
          if (ride.status !== RideStatus.LOOKING_FOR_DRIVER) {
               throw new BadRequestException('Ride is no longer available')
          }

          ride.driverId = driverId;
          ride.status = RideStatus.ACCEPTED;
          ride.actionById = driverId;
          return await
               this.rideRepository.save(ride);

     }

     async startRide(rideId: number, driverId: number) {

          const ride = await this.rideRepository.findOne({ where: { id: rideId } });
          if (!ride) throw new NotFoundException('Ride not found');
          if (ride.driverId !== driverId) throw new BadRequestException("You are not the driver for this ride")
          if (ride.status !== RideStatus.ACCEPTED) throw new BadRequestException("Ride must be accepted before starting");

          ride.status = RideStatus.IN_PROGRESS;
          ride.actionById = driverId;

          return await
               this.rideRepository.save(ride);

     }





     async completeRide(rideId: number, driverId: number) {
          const ride = await this.rideRepository.findOne({ where: { id: rideId } })

          if (!ride) throw new BadRequestException("Not the driver")
          if (ride.status !== RideStatus.IN_PROGRESS) throw new BadRequestException('Ride is not in progress')

          ride.status = RideStatus.COMPLETED;
          ride.actionById = driverId;
          return await this.rideRepository.save(ride);
     }

     async cancelRide(rideId: number, userId: number) {
          const ride = await this.rideRepository.findOne({ where: { id: rideId } });
          if (!ride) throw new NotFoundException('Ride not found');
          if (ride.passangerId !== userId && ride.driverId !== userId) {
               throw new BadRequestException('You do not have permission to cancel this ride');
          }
          if (ride.status === RideStatus.COMPLETED || ride.status === RideStatus.CANCELED) {
               throw new BadRequestException('Cannot cancel a completed or already canceled ride');
          }
          ride.status = RideStatus.CANCELED;
          ride.actionById = userId;
          return await this.rideRepository.save(ride);
     }
}




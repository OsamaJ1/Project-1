import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { User } from "../../users/user.entity";
import { RideStatus } from "../enums/ride.enum";
import { CURRENT_TIMESTAMP } from "../../utils/constants";

@Entity({ name: 'rides' })
export class Ride {

    @PrimaryGeneratedColumn()
    id: number;


    @ManyToOne(() => User)
    @JoinColumn({ name: 'passangerId' })
    passanger: User;

    @Column()
    passangerId: number;

    @ManyToOne(() => User, { nullable: true })
    @JoinColumn({ name: 'driverId' })
    driver: User;

    @Column({ nullable: true })
    driverId: number;

    @Column({ type: 'enum', enum: RideStatus, default: RideStatus.LOOKING_FOR_DRIVER })
    status: RideStatus


    @ManyToOne(() => User, { nullable: true })
    @JoinColumn({ name: 'actionById' })
    actionBy: User;

    @Column({ nullable: true })
    actionById: number;


    /////////////////////////////////////////

    @CreateDateColumn({ type: 'timestamp', default: () => CURRENT_TIMESTAMP })
    createdAt!: Date;

    @UpdateDateColumn({ type: 'timestamp', default: () => CURRENT_TIMESTAMP, onUpdate: CURRENT_TIMESTAMP })
    updatedAt!: Date;
}
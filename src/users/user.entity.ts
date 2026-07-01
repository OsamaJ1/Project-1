import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn, ManyToOne, OneToMany } from "typeorm";
import { CURRENT_TIMESTAMP } from '../utils/constants'
import { userType } from "../utils/constants";


@Entity({ name: 'users' })
export class User {

    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ type: 'varchar', length: '150', nullable: true }) //username can be null
    username!: string;

    @Column({ type: 'varchar', length: '250', unique: true })
    email!: string

    @Column()
    password!: string

    @Column({ type: 'enum', enum: userType, default: userType.PASSANGER })
    userType!: userType;

    @Column({ default: false })
    isAccountVerified!: boolean;

    @Column({ type: 'varchar', nullable: true, default: null })
    refreshToken!: string | null;

    @CreateDateColumn({ type: 'timestamp', default: () => CURRENT_TIMESTAMP })
    createdAt!: Date;

    @UpdateDateColumn({ type: 'timestamp', default: () => CURRENT_TIMESTAMP, onUpdate: CURRENT_TIMESTAMP })
    updatedAt!: Date;



}
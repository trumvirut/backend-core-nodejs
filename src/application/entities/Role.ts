import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import User from './User';
import Permission from './Permission';

@Entity()
export default class Role {
    @PrimaryGeneratedColumn()
    id: number;

    @Column('smallint', { unique: true })
    code: number;

    @Column({ length: 50, unique: true })
    name: string;

    @Column('smallint')
    level: number;

    @CreateDateColumn({ type: 'timestamptz' })
    createdAt: Date;

    @UpdateDateColumn({ type: 'timestamptz' })
    updatedAt: Date;

    @Column('timestamptz', { nullable: true })
    deletedAt?: Date;

    @OneToMany(() => User, user => user.role)
    users: User[];

    @OneToMany(() => Permission, permission => permission.role)
    permissions: Permission[];
};

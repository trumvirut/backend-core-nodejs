import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import Role from './Role';

@Entity()
@Index((permission: Permission) => [permission.role, permission.claim], { unique: true })
export default class Permission {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => Role, role => role.permissions)
    @JoinColumn()
    role: Role;

    @Column()
    roleId: number;

    @Column()
    claim: number;
};

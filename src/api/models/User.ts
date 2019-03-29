import * as bcrypt from 'bcrypt';
// import { Exclude } from 'class-transformer';
import { IsNotEmpty } from 'class-validator';
import { BeforeInsert, Column, Entity, OneToMany, PrimaryColumn } from 'typeorm';

import { Pet } from './Pet';

@Entity({ name: 'users' })
export class User {

    public static hashData(data: string): Promise<string> {
        return new Promise((resolve, reject) => {
            bcrypt.hash(data, 10, (err, hash) => {
                if (err) {
                    return reject(err);
                }
                resolve(hash);
            });
        });
    }

    public static comparePassword(user: User, password: string): Promise<boolean> {
        return new Promise((resolve, reject) => {
            bcrypt.compare(password, user.password, (err, res) => {
                resolve(res === true);
            });
        });
    }

    @PrimaryColumn('uuid')
    public id: string;

    @IsNotEmpty()
    @Column()
    // @Exclude()
    public email: string;

    @IsNotEmpty()
    @Column()
    // @Exclude()
    public password: string;

    @IsNotEmpty()
    @Column()
    public username: string;

    @OneToMany(type => Pet, pet => pet.user)
    public pets: Pet[];

    public toString(): string {
        return `${this.username}`;
    }

    @BeforeInsert()
    public async hashPassword(): Promise<void> {
        this.password = await User.hashData(this.password);
    }

    @BeforeInsert()
    public async hashEmail(): Promise<void> {
        this.email = await User.hashData(this.email);
    }

}

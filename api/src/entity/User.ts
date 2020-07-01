import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    Unique,
    CreateDateColumn,
    UpdateDateColumn
} from "typeorm";
import { Length, IsNotEmpty, IsEmpty } from "class-validator";
import * as bcrypt from "bcryptjs";

@Entity()
@Unique(["username"])
export class User {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    @Length(4, 20)
    username: string = '';

    @Column()
    @Length(4, 100)
    password: string = '';

    @Column()
    @IsNotEmpty()
    role: string = '';

    @Column()
    @IsEmpty()
    firstName?: string = '';


    @Column()
    @IsEmpty()
    lastName?: string = '';

    @Column({nullable: true})
    @IsEmpty()
    phone?: string;

    @Column({nullable: true})
    @IsEmpty()
    address?: string;

    @Column()
    @CreateDateColumn()
    createdAt: Date = new Date();

    @Column()
    @UpdateDateColumn()
    updatedAt: Date = new Date();

    hashPassword() {
        this.password = bcrypt.hashSync(this.password, 8);
    }

    checkIfUnencryptedPasswordIsValid(unencryptedPassword: string) {
        return bcrypt.compareSync(unencryptedPassword, this.password);
    }
}

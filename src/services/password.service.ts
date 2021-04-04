import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class PasswordService {
    private readonly SALT_ROUNDS: number = 10;

    generatePassword(
        password: string
    ): Promise<string> {
        return bcrypt.hash(password, this.SALT_ROUNDS);
    }

    comparePassword(
        password: String,
        hash: String
    ): Promise<boolean> {
        return bcrypt.compare(password, hash);
    }

    async createToken(email: string, id: string) {
        const  token = jwt.sign({ email, id }, "JWT_SECRET", { expiresIn: 5000 });
        return {
            expires_in: 5000,
            accse_token: token
        }
    }


}
import { ExtractJwt, Strategy } from "passport-jwt";
import { PassportStrategy } from "@nestjs/passport";
import { AuthService } from "../services/auth.service";
import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtPayload } from "../interfaces/jwtPayloadInterface";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(
        private readonly authService: AuthService,
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: "JWT_SECRET"
        });
    }

    async validate(payload: JwtPayload, done: Function) {
      
        const user = await this.authService.validateUser(payload);
        if (!user) {
            return done(new UnauthorizedException(), false);
        }

        done(null, user);
    }
}
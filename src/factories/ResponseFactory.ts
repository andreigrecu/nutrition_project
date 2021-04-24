import { HttpStatus } from '@nestjs/common';

export class ResponseFactory {
    private serverTime: Date;
    private statusCode: number;

    constructor() {
        let now = new Date();
        let now_utc = new Date(now.getUTCFullYear(), now.getUTCMonth(), 
            now.getUTCDate(), now.getUTCHours(), now.getUTCMinutes(), now.getUTCSeconds());
        this.serverTime = now_utc;
    }

    ok(data: any, response: any): any {
        this.statusCode = 200;
        let responseObject = {
            "data": data,
            "meta": {
                "serverTime": this.serverTime,
                "statusCode": this.statusCode,
                "message": "Request succed"
            }
        }
        
        response.status(HttpStatus.OK).json(responseObject);
    }

    notFound(errors: any = {}, response: any) {
        this.statusCode = 404;
        let responseObject = {
            "meta": {
                "serverTime": this.serverTime,
                "statusCode": this.statusCode,
                "message": "Request failed - NOT FOUND"
            },
            message: errors
        }

        response.status(HttpStatus.NOT_FOUND).json(responseObject);
    }

    error(errors: any = {}, response: any): any {
        this.statusCode = 500;
        let responseObject = {
            "meta": {
                "serverTime": this.serverTime,
                "statusCode": this.statusCode,
                "message": "Request failed - ERROR"
            },
            errors: errors
        }

        response.status(HttpStatus.INTERNAL_SERVER_ERROR).json(responseObject);
    }

    forbidden(message: string, response: any) {
        this.statusCode = 401;
        let responseObject = {
            "meta": {
                "serverTime": this.serverTime,
                "statusCode": this.statusCode,
                "message": message
            }
        }

        response.status(HttpStatus.FORBIDDEN).json(responseObject);
    }

    badRequest( errors: any = {}, response: any) {
        this.statusCode = 400;
        let responseObject = {
            "meta": {
                "serverTime": this.serverTime,
                "statusCode": this.statusCode,
                "message": "Request failed - ERROR"
            },
            message: errors
        }

        response.status(HttpStatus.INTERNAL_SERVER_ERROR).json(responseObject);
    }
}
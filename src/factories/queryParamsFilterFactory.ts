import { Like, Between, MoreThanOrEqual, LessThanOrEqual } from 'typeorm';

export class QueryParamsFilterFactory {
    public async filter(params: any) {
        let filteredParams = {};

        for(let param in params) {
            if(param === "limit" ||
               param === "page" ||
               param === "pagination" ||
               param === "sort_order" ||
               param === "sort_direction"
            )
                continue;

            let paramSize = params[param].split(',');

            if(paramSize.length === 3) {
                filteredParams[param] = Between(paramSize[1], paramSize[2]);
            }

            if (paramSize.length === 2) {

                if (parseInt(paramSize[0]) === 1) {
                    filteredParams[param] = MoreThanOrEqual(paramSize[1]);
                }

                if (parseInt(paramSize[0]) === 0) {
                    filteredParams[param] = LessThanOrEqual(paramSize[1]);
                }
            }

            if (paramSize.length === 1) {
                switch (typeof params[param]) {

                    case 'string':
                        filteredParams[param] = Like(params[param]);
                        break;
                    default:
                        filteredParams[param] = params[param];
                        break;
                }
            }
        }

        return filteredParams;
    }
}
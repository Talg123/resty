import { HTTP_STATUS_CODES } from '../consts';
import { IRestyResponse } from '../interfaces';

export class HttpResponse {

    private res: IRestyResponse;

    constructor(res: IRestyResponse) {
        this.res = res;
    }

    public OK(data: any, message: string = ''): void {
        return this.sendResponse(data, message, HTTP_STATUS_CODES.OK);
    }

    public ACCEPTED(data: any, message: string = ''): void {
        return this.sendResponse(data, message, HTTP_STATUS_CODES.ACCEPTED);
    }

    public NOTFOUND(data: any, message: string = ''): void {
        return this.sendResponse(data, message, HTTP_STATUS_CODES.NOTFOUND);
    }

    public SERVERERROR(data: any, message: string = ''): void {
        return this.sendResponse(data, message, HTTP_STATUS_CODES.SERVERERROR);
    }

    public UNAUTHORIZED(data: any, message: string = ''): void {
        return this.sendResponse(data, message, HTTP_STATUS_CODES.UNAUTHORIZED);
    }

    public BADREQUEST(data: any, message: string = ''): void {
        return this.sendResponse(data, message, HTTP_STATUS_CODES.BADREQUEST);
    }

    public sendResponse(data: any, message: string, statusCode: number): void {
        this.res.statusCode = statusCode || HTTP_STATUS_CODES.OK;
        this.res.setHeader('Content-Type', 'application/json');
        this.res.end(JSON.stringify({data, message, statusCode}));
    }
}
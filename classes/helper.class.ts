import { IMethodObject, IUrlParse, IPropertyIndex, 
    IRouteParams, IUrlBody, 
    IRestyHandlers, IRestyRequest, IRestyResponse, IFileBody } from "../interfaces";
import { ContentTypes, MULTIPART_DIVDER } from "../consts";
import * as Busboy from 'busboy';

export class RestyHelper {
    public static getUrlAndProperties(path: string): IPropertyIndex {
        if (!path.includes(":"))
            return {};
        return path.split('/')
            .map((str, i) => {
                if (str.includes(':'))
                    return {[str.slice(1)]: i - 1};
                return {};
            }).reduce((prv, crv) => ({...prv, ...crv}),{});
    }

    public static getCurrentRoute(routes: IMethodObject[], path: string): IRouteParams | undefined {
        const pathArray = path.split('?')[0].split('/');
        const route = routes.find(route => {
            const routePathArray = route.url.split('/');
            if(pathArray.length !== routePathArray.length)
                return;
            return routePathArray
                .every((routePath, index) => routePath.includes(':') || routePath === pathArray[index]);
        });
        if (!route) {
            return;
        }
        return {params: this.getRouteParamsData(route, path), route};
        
    }

    private static getRouteParamsData(route: IMethodObject, path: string): IUrlParse {
        if (!Object.keys(route.properties).length) return {};
        const pathArray = path.split('?')[0].split('/').slice(1); 
        return Object.keys(route.properties)
                .reduce((prv, crv) => ({...prv, [crv]: pathArray[route.properties[crv]]}),{});
    }

    public static getBodyParamsByContentType(data: string, ctype: string): IUrlBody {
        switch(ctype) {
            case ContentTypes["application/json"]: 
                return JSON.parse(data);
            case ContentTypes["application/x-www-form-urlencoded"]:
                const parsedData = data.split('&');
                return parsedData.reduce((prv, crv) => {
                    const currentValue = crv.split('=');
                    return {...prv, [currentValue[0]]: currentValue[1]};
                },{});
            default: 
                return {};
        }
    }

    public static async handleError(
        handlers: IRestyHandlers[],
        request: IRestyRequest,
        response: IRestyResponse,
        error: any): Promise<void> {
        const handler = handlers.find(route => {
            if (route.length === 4 && route.prototype.constructor.toString().includes('err')) 
                return true;
        })
        if (handler)
            await handler(request, response, () => {}, error);
    }

    public static async getMultipartData(req: IRestyRequest): Promise<IUrlBody> {
        return new Promise(res => {
            const data: IUrlBody = {};
            const busboy = new Busboy.default({headers: req.headers});
            busboy.on('file', (fieldname: string, file: NodeJS.ReadableStream, filename: string, encoding: string, mimetype: string) => {
                if (!req.files) req.files = {};
                const newFile: IFileBody = {
                    filename,
                    encoding,
                    mimetype,
                    data: Buffer.from('')
                };
                file.on('data', data => {
                  newFile.data = Buffer.concat([newFile.data,data]);
                });
                file.on('end', () => {
                    req.files[fieldname] = newFile;
                });
              });
              busboy.on('field', (fieldname, val) => {
                try {
                    data[fieldname] = JSON.parse(val);
                } catch (error) {
                    data[fieldname] = val;
                }
              });
              busboy.on('finish', () => {
                res(data);
              });
              req.pipe(busboy);
        })
    }

    public static getCurrentDate(): string {
        const date: any = new Date();
        const lowLevelDate = ['Hours', 'Minutes', 'Seconds', 'Milliseconds'];
        let currentTime = [];
        for (let llDate of lowLevelDate) {
            currentTime.push(date[`get${llDate}`]().toString().length > 1 ? date[`get${llDate}`]() : `0${date[`get${llDate}`]()}`);
        }
        return `${date.getDate()}/${date.getMonth()}/${date.getFullYear()} ${currentTime.join(':')}`;
    }

}